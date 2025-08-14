// app/api/sign/xml/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const SIGNER_BASE_URL = process.env.SIGNER_BASE_URL!;
    const SIGNER_SIGN_PATH = process.env.SIGNER_SIGN_PATH || "/api/sign/xml";
    const SIGNER_API_KEY = process.env.SIGNER_API_KEY!;
    const SIGNER_TIMEOUT_MS = Number(process.env.SIGNER_TIMEOUT_MS || 30000);

    if (!SIGNER_BASE_URL || !SIGNER_API_KEY) {
      return NextResponse.json(
        { error: "Signer misconfigurado. Revisa SIGNER_BASE_URL y SIGNER_API_KEY" },
        { status: 500 },
      );
    }

    const xml = await req.text(); // recibimos el XML crudo desde el cliente

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), SIGNER_TIMEOUT_MS);

    const resp = await fetch(`${SIGNER_BASE_URL}${SIGNER_SIGN_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "X-API-KEY": SIGNER_API_KEY,
      },
      body: xml,
      signal: ctrl.signal,
    }).finally(() => clearTimeout(t));

    const buf = await resp.arrayBuffer();
    return new NextResponse(buf, {
      status: resp.status,
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": resp.headers.get("Content-Disposition") || "attachment; filename=\"facturae-signed.xades\"",
      },
    });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Timeout firmando" : (e?.message || "Error firmando");
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
