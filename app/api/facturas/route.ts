// app/api/facturas/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { buildFacturaeXml } from '@/lib/invoice-signer';

const SIGNER_BASE_URL = process.env.SIGNER_BASE_URL || '';
const SIGNER_SIGN_PATH = process.env.SIGNER_SIGN_PATH || '/api/sign/xml';
const SIGNER_API_KEY = process.env.SIGNER_API_KEY || '';
const SIGNER_TIMEOUT_MS = Number(process.env.SIGNER_TIMEOUT_MS || '8000'); // ← Timeout duro

type Tipo = 'completa' | 'simplificada' | 'rectificativa';

type Body = {
  issueDate: string;
  type: Tipo;
  series?: string;
  totals: { total: number | string; subtotal?: number | string; iva?: number | string };
  clientId?: string | null;
  lines?: Array<{
    descripcion: string;
    cantidad: number | string;
    precio: number | string;
    iva: number | string;
    cuentaId?: string | null;
  }>;
  payment?: {
    method: string;
    iban?: string | null;
    paypalEmail?: string | null;
    notes?: string | null;
  } | null;
};

const money = (x: number | string | null | undefined) => {
  const n = typeof x === 'string' ? parseFloat(x.replace(',', '.')) : Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
};
const toInt = (x: unknown, fallback = 0) => {
  if (x == null) return fallback;
  const n = typeof x === 'string' ? parseFloat(x.replace(',', '.')) : Number(x);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
};
const isDuplicate = (err: any) =>
  (err?.code === '23505') ||
  /duplicate key value|unique constraint|user_series_number_uniq/i.test(
    err?.message || err?.details || ''
  );

function timeout<T>(ms: number, label = 'timeout'): Promise<T> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(label)), ms));
}

/** Máximo número actual para una serie del usuario. */
async function getMaxNumberForSeries(supabase: any, userId: string, series: string): Promise<number> {
  const { data, error } = await supabase
    .from('facturas')
    .select('number')
    .eq('user_id', userId)
    .eq('series', series)
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  const row = data as { number: number } | null;
  return row?.number ?? 0;
}

/** Serie por defecto desde profiles según el tipo. */
async function getDefaultSeriesForType(supabase: any, userId: string, type: Tipo): Promise<string> {
  const col =
    type === 'simplificada'
      ? 'invoice_series_simplified'
      : type === 'rectificativa'
      ? 'invoice_series_rectificative'
      : 'invoice_series_full';

  const { data, error } = await supabase
    .from('profiles')
    .select(col)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  const series = (data?.[col] as string | undefined) || 'FAC';
  return series.trim() || 'FAC';
}

/** Firma con timeout duro para no bloquear el endpoint. */
async function signWithTimeout(xml: string): Promise<{ b64: string | null; error: string | null }> {
  if (!SIGNER_BASE_URL || !SIGNER_API_KEY) {
    return { b64: null, error: 'Firmador no configurado (SIGNER_BASE_URL/API_KEY)' };
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), SIGNER_TIMEOUT_MS);

  try {
    const resp = await fetch(
      `${SIGNER_BASE_URL.replace(/\/+$/, '')}${SIGNER_SIGN_PATH}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml', 'X-API-Key': SIGNER_API_KEY },
        body: xml,
        signal: controller.signal,
      }
    );

    const text = await resp.text();
    if (!resp.ok) {
      const msg = text?.slice(0, 200) || `HTTP ${resp.status}`;
      return { b64: null, error: `Firma falló: ${msg}` };
    }
    return { b64: Buffer.from(text, 'utf8').toString('base64'), error: null };
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'timeout' : (e?.message || String(e));
    return { b64: null, error: msg };
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = (await req.json()) as Body;
    if (!body?.issueDate || !body?.type || body?.totals?.total == null) {
      return NextResponse.json({ error: 'Body incompleto' }, { status: 400 });
    }

    // Totales y líneas
    const total = money(body.totals.total);
    const subtotal = money(body.totals.subtotal ?? 0);
    const iva = money(body.totals.iva ?? total - subtotal);
    const lines = (body.lines ?? []).map((l) => ({
      descripcion: l.descripcion,
      cantidad: money(l.cantidad),
      precio: money(l.precio),
      iva: toInt(l.iva, 0),
      cuentaId: l.cuentaId ?? null,
    }));

    // Serie efectiva
    let series =
      (body.series?.toString().trim() || '') ||
      (await getDefaultSeriesForType(supabase, user.id, body.type));

    // Inserción con reserva de número (reintentos en colisión)
    const basePayload: any = {
      user_id: user.id,
      type: body.type,
      issue_date: body.issueDate,
      subtotal,
      iva,
      total,
      lines: lines.length ? lines : null,
      payment: body.payment ?? null,
      status: 'borrador',
    };
    if (body.clientId) basePayload.client_id = body.clientId;

    let finalNumber = 0;
    let insertedId: string | null = null;

    for (let attempt = 1; attempt <= 10; attempt++) {
      const next = (await getMaxNumberForSeries(supabase, user.id, series)) + 1;

      const { data: ins, error: insErr } = await supabase
        .from('facturas')
        .insert({ ...basePayload, series, number: next })
        .select('id')
        .single();

      if (!insErr && ins) {
        insertedId = ins.id as string;
        finalNumber = next;
        break;
      }
      if (isDuplicate(insErr)) continue;
      throw insErr;
    }

    if (!insertedId) {
      return NextResponse.json(
        { error: 'No se pudo reservar numeración única tras varios intentos.' },
        { status: 409 }
      );
    }

    // Construcción del XML (rápido)
    const xmlStr: string = await Promise.resolve(
      buildFacturaeXml({
        series,
        number: finalNumber,
        issueDate: body.issueDate,
        seller: {}, // completa si tu helper lo requiere
        lines,
        totals: { total, subtotal, iva },
        type: body.type,
        payment: body.payment ?? null,
      })
    );

    // Firma con timeout: no bloqueamos el guardado
    let signError: string | null = null;
    let signedB64: string | null = null;
    try {
      const res = await signWithTimeout(xmlStr); // ← máximo SIGNER_TIMEOUT_MS
      signedB64 = res.b64;
      signError = res.error;

      if (signedB64) {
        await supabase
          .from('facturas')
          .update({ facturae_signed_b64: signedB64, status: 'emitida' })
          .eq('id', insertedId)
          .eq('user_id', user.id);
      }
    } catch (e: any) {
      signError = e?.message || 'firma_desconocida';
    }

    // Respondemos SIEMPRE: el UI ya no se quedará colgado
    return NextResponse.json(
      {
        id: insertedId,
        series,
        number: finalNumber,
        facturaeBase64: signedB64,  // puede ser null
        signError,                  // "timeout" u otro texto si falló
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
