import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const body = await request.json();
  const { facturaId, tipo } = body;

  try {
    const { error } = await supabase.from("reintentos_envio").insert([
      {
        factura_id: facturaId,
        tipo_envio: tipo,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reintento programado correctamente",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error al programar reintento" },
      { status: 500 }
    );
  }
}
