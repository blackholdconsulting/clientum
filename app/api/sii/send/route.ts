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
    // Obtener factura
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

    // Aquí iría la lógica real para enviar al SII (Facturae)
    // Ejemplo de simulación
    console.log("Enviando factura a Facturae (SII)...", factura.numero);

    return NextResponse.json({
      success: true,
      message: `Factura ${factura.numero} enviada correctamente a Facturae (SII)`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error al enviar a Facturae" },
      { status: 500 }
    );
  }
}

