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

type Tipo = 'completa' | 'simplificada' | 'rectificativa';

type Body = {
  issueDate: string;
  type: Tipo;
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

async function trySignXml(xml: string): Promise<{ b64: string | null; error: string | null }> {
  try {
    if (!SIGNER_BASE_URL || !SIGNER_API_KEY) {
      return { b64: null, error: 'Firmador no configurado (SIGNER_BASE_URL/API_KEY)' };
    }
    const resp = await fetch(`${SIGNER_BASE_URL.replace(/\/+$/, '')}${SIGNER_SIGN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml', 'X-API-Key': SIGNER_API_KEY },
      body: xml,
    });
    const text = await resp.text();
    if (!resp.ok) {
      const msg = text?.slice(0, 200) || `HTTP ${resp.status}`;
      return { b64: null, error: `Firma falló: ${msg}` };
    }
    return { b64: Buffer.from(text, 'utf8').toString('base64'), error: null };
  } catch (e: any) {
    return { b64: null, error: String(e?.message || e) };
  }
}

/** Lee el máximo `number` existente para una SERIE del usuario (tipado laxo para el cliente). */
async function getMaxNumberForSeries(
  supabase: any, // ← relajamos tipo para evitar choque de genéricos
  userId: string,
  series: string
): Promise<number> {
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

/** Ajusta el contador del perfil (por tipo) al máximo+1 real para esa serie. */
async function fastForwardNextNumber(
  supabase: any, // ← relajamos tipo aquí también
  userId: string,
  type: Tipo,
  series: string
): Promise<void> {
  const maxNum = await getMaxNumberForSeries(supabase, userId, series);
  const next = (toInt(maxNum, 0) || 0) + 1;

  const col =
    type === 'simplificada'
      ? 'invoice_next_number_simplified'
      : type === 'rectificativa'
      ? 'invoice_next_number_rectificative'
      : 'invoice_next_number_full';

  const { error } = await supabase
    .from('profiles')
    .update({ [col]: next })
    .eq('id', userId);
  if (error) throw error;
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies }); // TS aquí da un cliente tipado, pero nuestros helpers aceptan any
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = (await req.json()) as Body;
    if (!body?.issueDate || !body?.type || body?.totals?.total == null) {
      return NextResponse.json({ error: 'Body incompleto' }, { status: 400 });
    }

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

    let insertedId: string | null = null;
    let finalSeries = '';
    let finalNumber = 0;

    // Reintentos suaves para colisiones de numeración
    const SOFT_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= SOFT_ATTEMPTS; attempt++) {
      const { data: seq, error: seqErr } = await supabase.rpc('fn_use_next_invoice_number_v2', {
        p_user: user.id,
        p_date: body.issueDate,
        p_type: body.type,
      });
      if (seqErr) throw seqErr;

      const series: string = String(seq?.series ?? 'FAC');
      const number: number = toInt(seq?.number, 1);

      const payload: any = {
        user_id: user.id,
        series,
        number,
        type: body.type,
        issue_date: body.issueDate,
        subtotal,
        iva,
        total,
        lines: lines.length ? lines : null,
        payment: body.payment ?? null,
        status: 'borrador',
      };
      if (body.clientId) payload.client_id = body.clientId;

      const { data: ins, error: insErr } = await supabase
        .from('facturas')
        .insert(payload)
        .select('id')
        .single();

      if (!insErr && ins) {
        insertedId = ins.id as string;
        finalSeries = series;
        finalNumber = number;
        break;
      }

      const code = (insErr as any)?.code || '';
      const msg = (insErr as any)?.message || (insErr as any)?.details || '';
      const isDup =
        code === '23505' ||
        /duplicate key value|unique constraint|user_series_number_uniq/i.test(msg);

      if (!isDup) throw insErr;

      if (attempt === SOFT_ATTEMPTS) {
        // Fast-forward: ajustamos contador al máximo+1 real y reintentamos una vez
        await fastForwardNextNumber(supabase, user.id, body.type, series);

        const { data: seq2, error: seqErr2 } = await supabase.rpc('fn_use_next_invoice_number_v2', {
          p_user: user.id,
          p_date: body.issueDate,
          p_type: body.type,
        });
        if (seqErr2) throw seqErr2;

        const ffSeries: string = String(seq2?.series ?? series);
        const ffNumber: number = toInt(seq2?.number, 1);

        const payloadFF: any = {
          user_id: user.id,
          series: ffSeries,
          number: ffNumber,
          type: body.type,
          issue_date: body.issueDate,
          subtotal,
          iva,
          total,
          lines: lines.length ? lines : null,
          payment: body.payment ?? null,
          status: 'borrador',
        };
        if (body.clientId) payloadFF.client_id = body.clientId;

        const { data: ins2, error: insErr2 } = await supabase
          .from('facturas')
          .insert(payloadFF)
          .select('id')
          .single();

        if (insErr2) {
          const code2 = (insErr2 as any)?.code || '';
          const msg2 = (insErr2 as any)?.message || (insErr2 as any)?.details || '';
          const isDup2 =
            code2 === '23505' ||
            /duplicate key value|unique constraint|user_series_number_uniq/i.test(msg2);
          if (isDup2) throw new Error('No se pudo reservar numeración única tras varios intentos.');
          throw insErr2;
        }

        insertedId = ins2!.id as string;
        finalSeries = ffSeries;
        finalNumber = ffNumber;
        break;
      }
    }

    if (!insertedId) {
      return NextResponse.json({ error: 'No se pudo insertar la factura' }, { status: 500 });
    }

    // Construye y firma (la firma no bloquea el guardado)
    const xmlStr: string = await Promise.resolve(
      buildFacturaeXml({
        series: finalSeries,
        number: finalNumber,
        issueDate: body.issueDate,
        seller: {}, // completa si tu helper lo requiere
        lines,
        totals: { total, subtotal, iva },
        type: body.type,
        payment: body.payment ?? null,
      })
    );

    const { b64: signedB64, error: signError } = await trySignXml(xmlStr);
    if (signedB64) {
      await supabase
        .from('facturas')
        .update({ facturae_signed_b64: signedB64, status: 'emitida' })
        .eq('id', insertedId)
        .eq('user_id', user.id);
    }

    return NextResponse.json(
      {
        series: finalSeries,
        number: finalNumber,
        facturaeBase64: signedB64 || null,
        signError: signError || null,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
