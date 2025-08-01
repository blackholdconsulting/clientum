import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    // Total pendientes
    const { count: pendientes } = await supabase
      .from("reintentos_envio")
      .select("*", { count: "exact", head: true })
      .eq("estado", "pendiente");

    // Último intento
    const { data: ultimo } = await supabase
      .from("reintentos_envio")
      .select("ultimo_intento")
      .order("ultimo_intento", { ascending: false })
      .limit(1)
      .single();

    // Tasa de éxito = facturas aceptadas / facturas enviadas
    const { count: aceptadas } = await supabase
      .from("facturas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aceptada");

    const { count: enviadas } = await supabase
      .from("facturas")
      .select("*", { count: "exact", head: true })
      .neq("estado", "borrador");

    const tasa_exito =
      enviadas && enviadas > 0
        ? Math.round(((aceptadas || 0) / enviadas) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        pendientes: pendientes || 0,
        ultimo_intento: ultimo?.ultimo_intento || null,
        tasa_exito,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error al obtener KPI" },
      { status: 500 }
    );
  }
}
