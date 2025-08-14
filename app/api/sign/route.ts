import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // importante: necesitamos Buffer

const BASE = process.env.CLIENTUMSIGN_URL ?? process.env.SIGNER_BASE_URL;
const PATH = process.env.SIGNER_SIGN_PATH ?? "/api/sign/xml";
const API_KEY = process.env.SIGNER_API_KEY;
const TIMEOUT = Number(process.env.SIGNER_TIMEOUT_MS ?? "30000");

// Nombre por defecto si el upstream no lo envía
const DEFAULT_FILENAME = "facturae-signed.xml";

export async function POST(req: NextRequest) {
  if (!BASE) {
    return NextResponse.json(
      { error: "Falta CLIENTUMSIGN_URL o SIGNER_BASE_URL" },
      { status: 500 }
    );
  }

  const xml = await req.text();

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const upstream = await fetch(`${BASE}${PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        "Accept": "application/xml, application/octet-stream, application/json",
        ...(API_KEY ? { "x-api-key": API_KEY } : {}),
      },
      body: xml,
      signal: controller.signal,
    });
    clearTimeout(t);

    // Si el micro responde con error, devolvemos el mismo status y texto
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return new NextResponse(text || `Upstream error ${upstream.status}`, {
        status: upstream.status,
        headers: {
          "content-type":
            upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
        },
      });
    }

    const ct = upstream.headers.get("content-type") ?? "";

    // Caso A: el micro devuelve JSON con { signedXmlBase64, filename?, contentType? }
    if (ct.includes("application/json")) {
      const j = await upstream.json();
      const b64: string =
        j.signedXmlBase64 || j.fileBase64 || j.data || j.content;
      if (!b64) {
        return NextResponse.json(
          { error: "JSON sin 'signedXmlBase64' ni contenido" },
          { status: 502 }
        );
      }
      const bin = Buffer.from(b64, "base64");
      const fname: string = j.filename || DEFAULT_FILENAME;
      const outType: string = j.contentType || "application/xml";
      return new NextResponse(bin, {
        status: 200,
        headers: {
          "content-type": outType,
          "content-disposition": `attachment; filename="${fname}"`,
        },
      });
    }

    // Caso B: el micro devuelve el XML/binario directamente
    const blob = await upstream.blob();
    const disp =
      upstream.headers.get("content-disposition") ||
      `attachment; filename="${DEFAULT_FILENAME}"`;
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "content-type": ct || "application/xml",
        "content-disposition": disp,
      },
    });
  } catch (err: any) {
    clearTimeout(t);
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      { error: isTimeout ? "timeout" : "proxy_error", detail: String(err) },
      { status: 502 }
    );
  }
}
