export const runtime = "nodejs";

export async function POST(req: Request) {
  const base = process.env.CLIENTUMSIGN_URL;
  if (!base) return new Response("Falta CLIENTUMSIGN_URL", { status: 500 });

  const payload = await req.json(); // JSON con la factura para AEAT

  const resp = await fetch(`${base}/api/verifactu/alta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return new Response(await resp.arrayBuffer(), {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "application/json",
    },
  });
}
