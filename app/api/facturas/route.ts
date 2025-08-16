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
  issueDate: string; // YYYY-MM-DD
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

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = (await req.json()) as Body;
    if (!body?.issueDate || !body?.type || body?.totals?.total == null) {
      return NextResponse.json({ error: 'Body incompleto' }, { status: 400 });
    }

    // Normaliza importes y líneas
    const total = money(body.totals.total);
    const subtotal = money(body.totals.subtotal ?? 0);
    const iva = money(body.totals.iva ?? total - subtotal);
    const lines = (body.lines ?? []).map(l => ({
      descripcion: l.descripcion,
      cantidad: money(l.cantidad),
      precio: money(l.precio),
      iva: toInt(l.iva, 0),
      cuentaId: l.cuentaId ?? null,
    }));

    // --- Inserción con reintento ante duplicado (23505) ---
    let insertedId: string | null = null;
    let finalSeries = '';
    let finalNumber = 0;
    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // 1) Reserva atómica por tipo
      const { data: seq, error: seqErr } = await supabase.rpc('fn_use_next_invoice_number_v2', {
        p_user: user.id,
        p_date: body.issueDate,
        p_type: body.type,
      });
      if (seqErr) throw seqErr;

      const series: string = String(seq?.series ?? 'FAC');
      const number: number = toInt(seq?.number, 1);

      // 2) Insert
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

      if (!isDup) {
        // Otro error → no reintentamos
        throw insErr;
      }
      // Si hay duplicado, volvemos al bucle a reservar otro número
      if (attempt === MAX_ATTEMPTS) {
        throw new Error('No se pudo reservar numeración única tras varios intentos.');
      }
    }

    if (!insertedId) {
      return NextResponse.json({ error: 'No se pudo insertar la factura' }, { status: 500 });
    }

    // 3) Construye y firma (no bloquea el guardado si falla)
    const xmlStr: string = await Promise.resolve(
      buildFacturaeXml({
        series: finalSeries,
        number: finalNumber,
        issueDate: body.issueDate,
        seller: {}, // completa según tu helper si lo requiere
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
