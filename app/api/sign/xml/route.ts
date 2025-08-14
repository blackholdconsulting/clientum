export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const BASE = process.env.SIGNER_BASE_URL!;
const PATH = process.env.SIGNER_SIGN_PATH || '/api/sign/xml';
const API_KEY = process.env.SIGNER_API_KEY!;

export async function POST(req: Request) {
  try {
    const xml = await req.text();
    if (!xml || !xml.trim()) {
      return NextResponse.json({ error: 'Body XML vacío.' }, { status: 400 });
    }

    const upstream = await fetch(`${BASE}${PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'X-API-Key': API_KEY,
      },
      body: xml,
    });

    const buf = await upstream.arrayBuffer();
    // Reenviamos tal cual el status y content-type del microservicio
    return new NextResponse(buf, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('Content-Type') ?? 'application/octet-stream',
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Fallo al proxyar la firma' },
      { status: 502 }
    );
  }
}

export async function GET() {
  // Health simple del proxy
  return NextResponse.json({ ok: true, use: 'POST application/xml' });
}
