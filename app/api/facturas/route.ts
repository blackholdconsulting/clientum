export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { buildFacturaeXml, signFacturaeXml } from '@/lib/invoice-signer';
import { formatPaymentForPdf } from '@/lib/pdf-payment';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SIGNER_API_KEY = process.env.SIGNER_API_KEY!;

type Payment = {
  method:
    | 'transfer'
    | 'domiciliacion'
    | 'paypal'
    | 'tarjeta'
    | 'efectivo'
    | 'bizum'
    | 'otro';
  iban?: string | null;
  paypalEmail?: string | null;
  notes?: string | null;
};

type InvoiceBody = {
  issueDate?: string; // YYYY-MM-DD
  type?: 'completa' | 'simplificada' | 'rectificativa';
  customer?: any;
  items?: any[];
  totals?: { base: number; tax: number; total: number };
  payment: Payment;
  // ...otros campos que ya uses en tu builder
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InvoiceBody;

    // 1) Usuario autenticado
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      undefined;

    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userRes } = await supabaseAnon.auth.getUser(accessToken);
    const userId = userRes?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2) Reservar numeración de forma atómica (reseteo anual dentro de la función)
    const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const today = (body.issueDate && body.issueDate.slice(0, 10)) || new Date().toISOString().slice(0, 10);

    const { data: numData, error: numErr } = await supabaseSrv.rpc(
      'fn_use_next_invoice_number',
      { p_user: userId, p_date: today }
    );
    if (numErr) throw numErr;

    const { series, number } = (Array.isArray(numData) ? numData[0] : numData) || {};
    if (!series || typeof number !== 'number') {
      return NextResponse.json({ error: 'No se pudo reservar numeración' }, { status: 500 });
    }

    // 3) Preparar bloque “Forma de pago” legible para PDF (opcional en la respuesta)
    const paymentBlock = formatPaymentForPdf(body.payment.method as any, {
      iban: body.payment.iban ?? null,
      paypal: body.payment.paypalEmail ?? null,
      other: body.payment.notes ?? null,
    });

    // 4) Construir Facturae XML (usa tu builder real si ya lo tienes)
    const facturaePayload = {
      ...body,
      serie: series,
      numero: number,
      // puedes pasar paymentBlock si tu builder lo usa para el PDF paralelo
    };
    const xml = await buildFacturaeXml(facturaePayload);

    // 5) Firmar con el proxy /api/sign/xml (signFacturaeXml ya lo llama)
    if (!SIGNER_API_KEY) throw new Error('Falta SIGNER_API_KEY');
    const signed = await signFacturaeXml(xml); // devuelve Uint8Array
    const facturaeBase64 = Buffer.from(signed).toString('base64');

    // 6) (Opcional) Persistir tu entidad factura aquí si ya tienes tabla definida
    //    — omitido para no romper tu schema, puedes añadirlo después.

    // 7) Responder con datos clave
    return NextResponse.json({
      ok: true,
      series,
      number,
      paymentBlock,
      facturaeBase64, // útil para "Descargar XAdES" en el cliente
      pdfUrl: null,   // integra tu generador si lo tienes
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Error creando factura' },
      { status: 500 }
    );
  }
}
