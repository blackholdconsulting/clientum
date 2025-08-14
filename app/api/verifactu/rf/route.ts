import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.SIGNER_BASE_URL!;
const PATH = process.env.VERIFACTU_RF_PATH || '/api/verifactu/rf';
const KEY  = process.env.SIGNER_API_KEY!;
const TIMEOUT_MS = Number(process.env.SIGNER_TIMEOUT_MS || '30000');

export async function POST(req: NextRequest) {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS);

  try {
    const json = await req.text();
    const res = await fetch(`${BASE}${PATH}`, {
      method: 'POST',
      headers: {
        'X-API-Key': KEY,
        'Content-Type': 'application/json',
      },
      body: json,
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(res.body, { status: res.status, headers: { 'content-type': contentType }});
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'proxy_error' }, { status: 502 });
  } finally {
    clearTimeout(to);
  }
}
