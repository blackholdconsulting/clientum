export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildFacturaeXml, signFacturaeXml } from '@/lib/invoice-signer';
import { formatPaymentForPdf } from '@/lib/pdf-payment';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type PaymentMethod =
  | 'transfer'
  | 'direct_debit'
  | 'paypal'
  | 'card'
  | 'cash'
  | 'bizum'
  | 'other';

type InvoiceInput = {
  issueDate: string;
  type: 'completa' | 'simplificada' | 'rectificativa';
  customer: { name: string; taxId?: string; address?: string; email?: string };
  items: Array<{ description: string; quantity: number; unitPrice: number; taxRate: number }>;
  totals: { base: number; tax: number; total: number };
  payment: { method: PaymentMethod; iban?: string | null; paypalEmail?: string | null; notes?: string | null };
  corrective?: { reason?: string; correctedSeries?: string; correctedNumber?: number; correctedIssueDate?: string };
  showQR?: boolean;
  meta?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InvoiceInput;

    if (!body?.issueDate || !body?.totals?.total || !body?.type) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: issueDate, totals.total, type' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      null;

    if (!accessToken) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userRes, error: userErr } = await supabaseAnon.auth.getUser(accessToken);
    if (userErr || !userRes?.user?.id) {
      return NextResponse.json({ error: 'No se pudo resolver el usuario' }, { status: 401 });
    }
    const userId = userRes.user.id;

    // 1) Numeración atómica
    const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: claim, error: claimErr } = await supabaseSrv.rpc('claim_next_invoice_number', {
      p_user_id: userId,
      p_issue_date: body.issueDate,
    });
    if (claimErr || !claim?.[0]?.invoice_series || !claim?.[0]?.invoice_number) {
      return NextResponse.json(
        { error: 'No se pudo obtener numeración: ' + (claimErr?.message ?? 'desconocido') },
        { status: 500 }
      );
    }
    const serie: string = claim[0].invoice_series;
    const numero: number = claim[0].invoice_number;

    // 2) Construir XML (usa tu builder real)
    const facturaePayload = { ...body, serie, numero };
    const xml = await buildFacturaeXml(facturaePayload as any);

    // 3) Firmar XML con proxy /api/sign/xml
    let signedBytes: Uint8Array;
    try {
      signedBytes = await signFacturaeXml(xml);
    } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : 'Error al firmar Facturae.';
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // 4) Sección de pago (para tu PDF actual)
    const _paymentSection = formatPaymentForPdf(
      body.payment.method,
      body.payment.iban ?? null,
      body.payment.paypalEmail ?? null,
      body.payment.notes ?? null
    );
    const pdfUrl: string | null = null; // integra en tu generador de PDF

    // 5) Persistir
    const insertPayload = {
      user_id: userId,
      series: serie,
      number: numero,
      issue_date: body.issueDate,
      type: body.type,
      customer: body.customer,
      items: body.items,
      totals: body.totals,
      payment: body.payment,
      corrective: body.corrective ?? null,
      meta: body.meta ?? null,
      pdf_url: pdfUrl,
      facturae_signed_b64: Buffer.from(signedBytes).toString('base64'),
      created_at: new Date().toISOString(),
    };
    const { error: insErr } = await supabaseSrv.from('invoices').insert(insertPayload);
    if (insErr) {
      return NextResponse.json({ error: 'Error al guardar: ' + insErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      serie,
      numero,
      pdfUrl,
      facturaeBase64: Buffer.from(signedBytes).toString('base64'),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error inesperado' }, { status: 500 });
  }
}

