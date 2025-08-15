import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SIGNER_BASE_URL!;
const KEY  = process.env.SIGNER_API_KEY!;
const PATH = process.env.SIGNER_RF_PATH ?? "/api/verifactu/rf";

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

    const text = await upstream.text();
    let data: any; try { data = JSON.parse(text); } catch { data = text; }

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream_error", status: upstream.status, data },
        { status: upstream.status }
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
        { error: "proxy_error", message: e?.message ?? String(e) },
        { status: 502 }
    );
  }
}
