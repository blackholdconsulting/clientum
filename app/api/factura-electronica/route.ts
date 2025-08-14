// Proxy a clientumsign: genera + firma Facturae (XAdES-EPES)
import { NextResponse } from "next/server";

const BASE = process.env.SIGNER_BASE_URL!;
const API_KEY = process.env.SIGNER_API_KEY || "";
const TIMEOUT = Number(process.env.SIGNER_TIMEOUT_MS || 30000);

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { invoice: FacturaMin }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT);

    const resp = await fetch(`${BASE}/api/facturae/sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);

    const text = await resp.text();
    if (!resp.ok) {
      return NextResponse.json({ error: text || resp.statusText }, { status: resp.status });
    }
    return new Response(text, { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

