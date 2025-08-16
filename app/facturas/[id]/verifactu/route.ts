import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

async function columnExists(supabase: any, col: string) {
  const { error } = await supabase.from("facturas").select(col).limit(1);
  return !(error && (error as any).code === "42703");
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies });

  // 1) lee la factura
  const { data: inv, error } = await supabase.from("facturas").select("*").eq("id", ctx.params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 2) compón payload mínimo para tu micro
  const payload = {
    serie: inv.serie ?? inv.series ?? "",
    numero: inv.number ?? inv.numero ?? 0,
    fecha: inv.issued_at ?? inv.fecha ?? inv.created_at,
    total: inv.total ?? inv.importe ?? 0,
    cliente: inv.cliente ?? inv.customer_name ?? "",
    base: inv.base ?? undefined,
    iva: inv.iva ?? undefined,
  };

  const url = process.env.VERIFACTU_URL;
  const key = process.env.VERIFACTU_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Configura VERIFACTU_URL y VERIFACTU_KEY" }, { status: 400 });
  }

  // 3) llamada a tu servicio VeriFactu
  let rf = "";
  let qrDataUrl: string | null = null;
  try {
    const r = await fetch(`${url}/alta`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error ?? "Error VeriFactu");
    rf = j?.rf ?? j?.reference ?? "";
    qrDataUrl = j?.qrDataUrl ?? j?.qr?.pngDataUrl ?? null;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "No se pudo registrar" }, { status: 400 });
  }

  // 4) guarda RF/QR si hay columnas
  const canRf = await columnExists(supabase, "rf");
  const canQr = await columnExists(supabase, "verifactu_qr_data_url");
  const canStatus = await columnExists(supabase, "status");

  const update: any = {};
  if (canRf) update.rf = rf;
  if (canQr && qrDataUrl) update.verifactu_qr_data_url = qrDataUrl;
  if (canStatus) update.status = "registrada";

  if (Object.keys(update).length) {
    await supabase.from("facturas").update(update).eq("id", ctx.params.id);
  }

  return NextResponse.json({ rf, qrDataUrl });
}
