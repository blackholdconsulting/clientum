import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const body = await request.json();
  const { facturaId } = body;

  try {
    // 1️⃣ Obtener factura
    const { data: factura, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", facturaId)
      .single();

    if (error || !factura) {
      return NextResponse.json(
        { success: false, message: error?.message || "Factura no encontrada" },
        { status: 404 }
      );
    }

    // 2️⃣ Envío real al SII (simulación)
    console.log("Enviando factura a Facturae...", factura.numero);

    // Simulación de respuesta AEAT
    const respuestaAEAT = {
      estado: "aceptada",
      csv: "CSV-123-FAKE",
    };

    // 3️⃣ Actualizar estado y CSV automáticamente
    const { error: updateError } = await supabase
      .from("facturas")
      .update({
        estado: respuestaAEAT.estado,
        csv: respuestaAEAT.csv,
      })
      .eq("id", facturaId);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Factura ${factura.numero} enviada correctamente a Facturae (SII)`,
      result: respuestaAEAT,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error al enviar a Facturae" },
      { status: 500 }
    );
  }
}
