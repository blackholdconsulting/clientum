import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SIGNER_BASE_URL!;
const KEY  = process.env.SIGNER_API_KEY!;
const PATH = process.env.SIGNER_QR_PATH ?? "/api/verifactu/qr";

export async function POST(req: NextRequest) {
  try {
    if (!BASE || !KEY) {
      return NextResponse.json(
        { error: "misconfigured", details: "SIGNER_BASE_URL or SIGNER_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const upstream = await fetch(`${BASE}${PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signer-Key": KEY,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json(
        { error: "upstream_error", status: upstream.status, data: text },
        { status: upstream.status }
      );
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    return new NextResponse(buf, {
      status: 200,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "image/png" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "proxy_error", message: e?.message ?? String(e) },
      { status: 502 }
    );
  }
}
