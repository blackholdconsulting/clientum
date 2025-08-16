// app/api/verifactu/alta/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';
import type { InvoiceTypeVF } from '@/lib/verifactu';

type AltaBody = {
  issuerTaxId: string;
  issueDate: string;               // YYYY-MM-DD
  total: number;
  invoiceType: InvoiceTypeVF;      // 'completa' | 'simplificada' | 'rectificativa'
  series: string;
  number: number;
};

const VERIFACTU_BASE_URL = process.env.VERIFACTU_BASE_URL || '';
const VERIFACTU_API_KEY  = process.env.VERIFACTU_API_KEY || '';
const VERIFACTU_MODE     = (process.env.VERIFACTU_MODE || '').toLowerCase(); // 'prod' | 'mock' (default mock)

/**
 * Genera un RF determinista (mock) a partir de los datos:
 * VF + 26 chars hex de SHA256(issuerTaxId|date|total|type|series|number|saltYYYY)
 */
function rfMockFrom(body: AltaBody): string {
  const salt = new Date().getFullYear().toString(); // cambia anualmente para evitar colisiones muy antiguas
  const raw = `${body.issuerTaxId}|${body.issueDate}|${body.total.toFixed(2)}|${body.invoiceType}|${body.series}|${body.number}|${salt}`;
  const h = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
  return `VF${h.slice(0, 26)}`;
}

export async function POST(req: Request) {
  try {
    // Auth (para mantener RLS coherente, aunque no es estrictamente necesario aquí)
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = (await req.json()) as AltaBody;

    // Validaciones mínimas
    if (!body?.issuerTaxId || !body?.issueDate || !body?.total || !body?.invoiceType || !body?.series || !body?.number) {
      return NextResponse.json({ error: 'Body incompleto' }, { status: 400 });
    }

    // MODO MOCK -> RF local
    if (VERIFACTU_MODE !== 'prod' || !VERIFACTU_BASE_URL) {
      const rf = rfMockFrom(body);
      // Regresamos RF y dejamos que el cliente construya el QR con lib/verifactu
      return NextResponse.json({ rf });
    }

    // MODO PROD -> proxy al conector que habla con AEAT
    const res = await fetch(`${VERIFACTU_BASE_URL.replace(/\/+$/, '')}/alta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(VERIFACTU_API_KEY ? { 'X-API-Key': VERIFACTU_API_KEY } : {}),
      },
      body: JSON.stringify(body),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: j?.error || `Alta Veri*factu falló (${res.status})` },
        { status: 502 }
      );
    }

    // Esperamos { rf: '...' } desde tu conector
    if (!j?.rf) {
      return NextResponse.json({ error: 'Respuesta sin RF' }, { status: 502 });
    }

    return NextResponse.json({ rf: String(j.rf) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
