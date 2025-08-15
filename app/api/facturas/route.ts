// app/api/facturas/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { buildFacturaeXml, signFacturaeXml } from '@/lib/invoice-signer';
import { formatPaymentForPdf } from '@/lib/pdf-payment';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SRV  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type InvoiceType = 'completa' | 'simplificada' | 'rectificativa';
type Payment = {
  method: 'transfer' | 'domiciliacion' | 'paypal' | 'tarjeta' | 'efectivo' | 'bizum' | 'otro';
  iban?: string | null;
  paypalEmail?: string | null;
  notes?: string | null;
};
type InvoiceBody = {
  issueDate?: string;           // YYYY-MM-DD
  type?: InvoiceType;           // default: 'completa'
  customer?: any;
  items?: any[];
  totals?: { base?: number; tax?: number; total: number };
  payment: Payment;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InvoiceBody;
    const type: InvoiceType = (body.type ?? 'completa');

    // ========= Autenticación robusta (Bearer -> cookies) =========
    const cookieStore = await cookies();

    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const tokenFromHeader =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : undefined;

    const tokenFromCookie =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      cookieStore.get('supabase-auth-token')?.value ??
      undefined;

    const accessToken = tokenFromHeader ?? tokenFromCookie;

    const anon = createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: u } = await anon.auth.getUser(accessToken);
    const userId = u?.user?.id;
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const srv = createClient(URL, SRV, { auth: { persistSession: false, autoRefreshToken: false } });

    // ========= Reserva de numeración por tipo (FAC/FACS/FAR) =========
    const today = (body.issueDate && body.issueDate.slice(0, 10)) || new Date().toISOString().slice(0, 10);
    const { data: numData, error: numErr } = await srv.rpc('fn_use_next_invoice_number_v2', {
      p_user: userId,
      p_date: today,
      p_type: type, // 'completa' | 'simplificada' | 'rectificativa'
    });
    if (numErr) throw numErr;

    const { series, number } = (Array.isArray(numData) ? numData[0] : numData) || {};
    if (!series || typeof number !== 'number') {
      return NextResponse.json({ error: 'No se pudo reservar numeración' }, { status: 500 });
    }

    // ========= Forma de pago (para el bloque del PDF) =========
    const paymentBlock = formatPaymentForPdf(body.payment.method as any, {
      iban: body.payment.iban ?? null,
      paypal: body.payment.paypalEmail ?? null,
      other: body.payment.notes ?? null,
    });

    // ========= Construcción de XML Facturae =========
    const facturaePayload = {
      ...body,
      serie: series,
      numero: number,
      type,                         // si 'rectificativa', tu builder debe añadir <Corrective/>
      _paymentBlock: paymentBlock,  // opcional para PDF
    };
    const xml = await buildFacturaeXml(facturaePayload);

    // ========= Firma XAdES a través del proxy /api/sign/xml =========
    const signed = await signFacturaeXml(xml);              // Uint8Array o ArrayBuffer
    const buf = signed instanceof Uint8Array ? signed : new Uint8Array(signed as ArrayBuffer);
    const facturaeBase64 = Buffer.from(buf).toString('base64');

    // ========= Respuesta =========
    return NextResponse.json({
      ok: true,
      series,
      number,
      type,
      paymentBlock,
      facturaeBase64,
      pdfUrl: null, // si generas PDF en server, pon aquí la URL
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error creando factura' }, { status: 500 });
  }
}
