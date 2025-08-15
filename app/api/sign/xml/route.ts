export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const BASE = process.env.SIGNER_BASE_URL!;
const PATH = process.env.SIGNER_SIGN_PATH || '/api/sign/xml';
const API_KEY = process.env.SIGNER_API_KEY!;

export async function POST(req: Request) {
  try {
    if (!BASE || !API_KEY) return NextResponse.json({ error: 'Falta configuración de firma.' }, { status: 500 });
    const xml = await req.text();
    const r = await fetch(new URL(PATH, BASE).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml', 'X-API-Key': API_KEY },
      body: xml,
    });
    if (r.status === 401 || r.status === 403) {
      const t = await r.text().catch(()=> ''); return new NextResponse(`Firma no autorizada (${r.status}). ${t}`, { status: r.status });
    }
    if (!r.ok) {
      const t = await r.text().catch(()=> ''); return new NextResponse(`Error firmando (${r.status}). ${t}`, { status: r.status });
    }
    const buf = await r.arrayBuffer();
    return new NextResponse(buf, { headers: { 'Content-Type': 'application/xml' } });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'Error en proxy de firma' }, { status: 500 });
  }
}
