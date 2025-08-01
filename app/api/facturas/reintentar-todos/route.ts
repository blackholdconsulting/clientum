import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    const { data: pendientes, error } = await supabase
      .from("reintentos_envio")
      .select("id, factura_id, tipo_envio, intentos")
      .eq("estado", "pendiente");

    if (error) throw new Error(error.message);
    if (!pendientes || pendientes.length === 0) {
      return NextResponse.json({ success: true, message: "No hay reintentos pendientes" });
    }

    for (const tarea of pendientes) {
      // Obtener factura
      const { data: factura } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", tarea.factura_id)
        .single();

      if (!factura) continue;

      let resultado;
      if (tarea.tipo_envio === "facturae") {
        console.log(`Reintentando Facturae: ${factura.numero}`);
        resultado = { estado: "aceptada", csv: "CSV-FACT-RETRY" }; // Simulación
      } else {
        console.log(`Reintentando Verifactu: ${factura.numero}`);
        resultado = { estado: "aceptada", csv: "CSV-VERI-RETRY" }; // Simulación
      }

      // Actualizar factura
      await supabase
        .from("facturas")
        .update({
          estado: resultado.estado,
          csv: resultado.csv,
        })
        .eq("id", factura.id);

      // Marcar reintento
      await supabase
        .from("reintentos_envio")
        .update({
          intentos: tarea.intentos + 1,
          estado: resultado.estado === "aceptada" ? "completado" : "pendiente",
          ultimo_intento: new Date().toISOString(),
        })
        .eq("id", tarea.id);
    }

    return NextResponse.json({ success: true, message: "Reintentos ejecutados correctamente" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error al ejecutar reintentos" },
      { status: 500 }
    );
  }
}
