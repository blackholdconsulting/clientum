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
const SIGNER_API_KEY = process.env.SIGNER_API_KEY!;

type InvoiceType = 'completa' | 'simplificada' | 'rectificativa';

type Payment = {
  method: 'transfer' | 'domiciliacion' | 'paypal' | 'tarjeta' | 'efectivo' | 'bizum' | 'otro';
  iban?: string | null; paypalEmail?: string | null; notes?: string | null;
};

type InvoiceBody = {
  issueDate?: string; // YYYY-MM-DD
  type?: InvoiceType;
  customer?: any;
  items?: any[];
  totals?: { base?: number; tax?: number; total: number };
  payment: Payment;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InvoiceBody;
    const type: InvoiceType = (body.type ?? 'completa');

    // auth
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      undefined;

    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data: u } = await anon.auth.getUser(accessToken);
    const userId = u?.user?.id;
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const srv = createClient(URL, SRV, { auth: { persistSession: false } });

    // reserva numeración por tipo
    const today = (body.issueDate && body.issueDate.slice(0, 10)) || new Date().toISOString().slice(0, 10);
    const { data: numData, error: numErr } = await srv.rpc('fn_use_next_invoice_number_v2', {
      p_user: userId, p_date: today, p_type: type
    });
    if (numErr) throw numErr;
    const { series, number } = (Array.isArray(numData) ? numData[0] : numData) || {};
    if (!series || typeof number !== 'number') {
      return NextResponse.json({ error: 'No se pudo reservar numeración' }, { status: 500 });
    }

    // bloque forma de pago para PDF (opcional)
    const paymentBlock = formatPaymentForPdf(body.payment.method as any, {
      iban: body.payment.iban ?? null,
      paypal: body.payment.paypalEmail ?? null,
      other: body.payment.notes ?? null,
    });

    // construir facturae con tipo (si rectificativa, tu builder incluirá <Corrective/>)
    const facturaePayload = {
      ...body,
      serie: series,
      numero: number,
      type,
      _paymentBlock: paymentBlock,
    };
    const xml = await buildFacturaeXml(facturaePayload);

    if (!SIGNER_API_KEY) throw new Error('Falta SIGNER_API_KEY');
    const signed = await signFacturaeXml(xml); // Uint8Array/XML firmado XAdES
    const facturaeBase64 = Buffer.from(signed).toString('base64');

    return NextResponse.json({
      ok: true,
      series, number, type,
      paymentBlock,
      facturaeBase64,
      pdfUrl: null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error creando factura' }, { status: 500 });
  }
}
