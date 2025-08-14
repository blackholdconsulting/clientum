// Proxy a clientumsign: genera RF y QR VERI*FACTU oficiales
import { NextResponse } from "next/server";

const BASE = process.env.SIGNER_BASE_URL!;
const API_KEY = process.env.SIGNER_API_KEY || "";
const TIMEOUT = Number(process.env.SIGNER_TIMEOUT_MS || 30000);

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { invoice: FacturaMin }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT);

    // 1) RF
    const rfResp = await fetch(`${BASE}/api/verifactu/rf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const rf = await rfResp.json();
    if (!rfResp.ok) {
      clearTimeout(t);
      return NextResponse.json(rf, { status: rfResp.status });
    }

    // 2) QR
    const qrResp = await fetch(`${BASE}/api/verifactu/qr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      },
      body: JSON.stringify({ rf }),
      signal: ctrl.signal,
    });
    clearTimeout(t);

    const qr = await qrResp.json();
    if (!qrResp.ok) {
      return NextResponse.json(qr, { status: qrResp.status });
    }

    return NextResponse.json({ rf, qr }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
