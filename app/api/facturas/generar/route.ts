import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const body = await request.json();
  const {
    cliente_id,
    fecha_emisor,
    fecha_vencim,
    concepto,
    base_imponib,
    iva_percent,
    iva_total,
    total,
    servicio,
    base,
    iva,
    via,
    emisor,
    receptor,
    json_factura
  } = body;

  try {
    const { data, error } = await supabase.from("facturas").insert([
      {
        cliente_id,
        fecha_emisor,
        fecha_vencim,
        concepto,
        base_imponib,
        iva_percent,
        iva_total,
        total,
        estado: "borrador",
        servicio,
        base,
        iva,
        via,
        emisor,
        receptor,
        json_factura
      }
    ]);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Factura generada correctamente",
      data
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
