// app/api/facturas/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { buildFacturaeXml } from '@/lib/invoice-signer'; // asumes que ya lo tienes
// Si tienes un helper para firmar, puedes importarlo; aquí llamamos al microservicio directamente.

const SIGNER_BASE_URL = process.env.SIGNER_BASE_URL || '';
const SIGNER_SIGN_PATH = process.env.SIGNER_SIGN_PATH || '/api/sign/xml';
const SIGNER_API_KEY   = process.env.SIGNER_API_KEY || '';

type Tipo = 'completa' | 'simplificada' | 'rectificativa';

type Body = {
  issueDate: string; // YYYY-MM-DD
  type: Tipo;
  totals: { total: number; subtotal?: number; iva?: number };
  clientId?: string | null;
  lines?: Array<{
    descripcion: string;
    cantidad: number;
    precio: number;
    iva: number;
    cuentaId?: string | null;
  }>;
  payment?: {
    method: string;
    iban?: string | null;
    paypalEmail?: string | null;
    notes?: string | null;
  } | null;
};

/** Firma el XML en ClientumSign (no lanza si falla; devuelve {b64|null, error|null}) */
async function trySignXml(xml: string): Promise<{ b64: string | null; error: string | null }> {
  try {
    if (!SIGNER_BASE_URL || !SIGNER_API_KEY) {
      return { b64: null, error: 'Firmador no configurado (SIGNER_BASE_URL/API_KEY)' };
    }
    const resp = await fetch(`${SIGNER_BASE_URL.replace(/\/+$/,'')}${SIGNER_SIGN_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'X-API-Key': SIGNER_API_KEY,
      },
      body: xml,
    });
    const text = await resp.text();
    if (!resp.ok) {
      const msg = text?.slice(0, 200) || `HTTP ${resp.status}`;
      return { b64: null, error: `Firma falló: ${msg}` };
    }
    // Si tu micro devuelve XML firmado, lo pasamos tal cual en base64
    const b64 = Buffer.from(text, 'utf8').toString('base64');
    return { b64, error: null };
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
    if (!body?.issueDate || !body?.type || !body?.totals?.total) {
      return NextResponse.json({ error: 'Body incompleto' }, { status: 400 });
    }

    // 1) Reserva atómica de numeración por tipo (usa tu función en DB)
    const { data: seq, error: seqErr } = await supabase.rpc('fn_use_next_invoice_number_v2', {
      p_user: user.id,
      p_date: body.issueDate,
      p_type: body.type,
    });
    if (seqErr) throw seqErr;
    const series: string = seq?.series || 'FAC';
    const number: number = seq?.number || 1;

    // 2) Inserta en histórico (RLS: user_id = auth.uid())
    const subtotal = body.totals.subtotal ?? 0;
    const iva      = body.totals.iva      ?? Math.max(0, body.totals.total - subtotal);
    const insertPayload = {
      user_id: user.id,
      client_id: body.clientId ?? null,
      series,
      number,
      type: body.type,
      issue_date: body.issueDate,
      subtotal,
      iva,
      total: body.totals.total,
      lines: body.lines ? JSON.parse(JSON.stringify(body.lines)) : null, // asegurar JSON serializable
      payment: body.payment ?? null,
      status: 'borrador' as const,
    };

    const { data: inserted, error: insErr } = await supabase
      .from('facturas')
      .insert(insertPayload)
      .select('id')
      .single();
    if (insErr) throw insErr;

    // 3) Construye XML Facturae con los datos mínimos (ajústalo a tu helper real)
    const xml = buildFacturaeXml({
      series,
      number,
      issueDate: body.issueDate,
      seller: { /* si tu helper lo necesita, pásale el perfil desde otra consulta */ },
      lines: body.lines || [],
      totals: body.totals,
      type: body.type,
      payment: body.payment ?? null,
    });

    // 4) Intenta firmar (pero NO rompemos el guardado si falla)
    const { b64: signedB64, error: signError } = await trySignXml(xml);

    // Si quieres persistir el firmado para histórico:
    if (signedB64) {
      await supabase.from('facturas')
        .update({ facturae_signed_b64: signedB64, status: 'emitida' })
        .eq('id', inserted.id)
        .eq('user_id', user.id);
    }

    // 5) Respuesta al cliente
    return NextResponse.json({
      series,
      number,
      facturaeBase64: signedB64 || null,
      signError: signError || null,
    }, { status: 201 });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
