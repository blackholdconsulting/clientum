import { NextResponse } from "next/server";
import { sendToSii } from "@/lib/sii/sendToSII";
import { createServerClient } from "@lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();

  const body = await request.json();
  const facturaId = body.facturaId; 
  const userId = body.userId || "default_user_id";

  try {
    // Enviar factura a AEAT
    const result = await sendToSii(facturaId, userId);

    // Actualizar estado en Supabase
    await supabase.from("facturas").update({
      estado: result?.estado || "ENVIADA",
      fecha: new Date()
    }).eq("id", facturaId).eq("user_id", userId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
