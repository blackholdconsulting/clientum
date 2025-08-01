import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    const { count: aceptadas } = await supabase
      .from("facturas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aceptada");

    const { count: rechazadas } = await supabase
      .from("facturas")
      .select("*", { count: "exact", head: true })
      .or("estado.eq.rechazada,estado.eq.error");

    const { count: pendientes } = await supabase
      .from("facturas")
      .select("*", { count: "exact", head: true })
      .or("estado.eq.pendiente,estado.eq.borrador");

    return NextResponse.json({
      success: true,
      stats: {
        aceptadas: aceptadas || 0,
        rechazadas: rechazadas || 0,
        pendientes: pendientes || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error al obtener estado de facturas" },
      { status: 500 }
    );
  }
}
