export const runtime = "nodejs";

export async function POST(req: Request) {
  const base = process.env.CLIENTUMSIGN_URL;
  if (!base) return new Response("Falta CLIENTUMSIGN_URL", { status: 500 });

  // El body será el XML Facturae sin firmar que generamos en el cliente
  const body = await req.text();

  const resp = await fetch(`${base}/api/facturae/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body,
  });

  return new Response(await resp.arrayBuffer(), {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "application/xml",
    },
  });
}
