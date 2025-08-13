// app/api/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BASE_URL = process.env.SIGNER_BASE_URL;          // e.g. https://clientumsign.onrender.com
const SIGN_PATH = process.env.SIGNER_SIGN_PATH ?? '/api/sign/xml';
const API_KEY   = process.env.SIGNER_API_KEY;          // debe coincidir con el microservicio
const TIMEOUT   = Number(process.env.SIGNER_TIMEOUT_MS ?? 30000);

function upstreamUrl() {
  if (!BASE_URL) {
    throw new Error('Falta la variable de entorno SIGNER_BASE_URL');
  }
  return new URL(SIGN_PATH, BASE_URL).toString();
}

export async function POST(req: NextRequest) {
  try {
    const url = upstreamUrl();
    const ct = req.headers.get('content-type') || '';

    // timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), TIMEOUT);

    // cabeceras comunes hacia el microservicio
    const commonHeaders: HeadersInit = {
      'x-api-key': API_KEY ?? '', // SecurityConfig debe validar esta cabecera
      'x-forwarded-host': req.headers.get('host') || '',
    };

    let upstreamResp: Response;

    if (ct.includes('application/json')) {
      const body = await req.json();
      upstreamResp = await fetch(url, {
        method: 'POST',
        headers: { ...commonHeaders, 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
        cache: 'no-store',
      });
    } else if (ct.includes('multipart/form-data')) {
      // Permite enviar archivo XML (FormData)
      const formData = await req.formData();
      upstreamResp = await fetch(url, {
        method: 'POST',
        headers: { ...commonHeaders }, // undici establece el boundary automáticamente
        body: formData as any,
        signal: controller.signal,
        cache: 'no-store',
      });
    } else if (ct.includes('text/xml') || ct.includes('application/xml')) {
      const xml = await req.text();
      upstreamResp = await fetch(url, {
        method: 'POST',
        headers: { ...commonHeaders, 'content-type': ct },
        body: xml,
        signal: controller.signal,
        cache: 'no-store',
      });
    } else {
      return NextResponse.json(
        { error: 'Content-Type no soportado. Usa application/json, multipart/form-data o XML.' },
        { status: 415 }
      );
    }

    clearTimeout(timer);

    // Propagar Content-Type y Content-Disposition (por si devuelve un archivo)
    const resHeaders = new Headers();
    const upstreamCT = upstreamResp.headers.get('content-type');
    const disp = upstreamResp.headers.get('content-disposition');
    if (upstreamCT) resHeaders.set('content-type', upstreamCT);
    if (disp) resHeaders.set('content-disposition', disp);

    // Devolvemos el cuerpo tal cual
    const buf = Buffer.from(await upstreamResp.arrayBuffer());
    return new NextResponse(buf, { status: upstreamResp.status, headers: resHeaders });
  } catch (err: any) {
    const status = err?.name === 'AbortError' ? 504 : 502;
    return NextResponse.json(
      { error: err?.message ?? 'Error al contactar el microservicio' },
      { status }
    );
  }
}
