import { NextResponse } from "next/server";
import { sendToSii } from "@/lib/sii/sendToSII";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerClient();

  const body = await request.json();
  const facturaId = body.facturaId; // asegúrate de enviar esto en el fetch desde el cliente
  const userId = body.userId || "default_user_id";

  try {
    // Ya no fallará buscando cldr en disco
    const result = await sendToSii(facturaId, userId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
