import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { success: false, message: "Faltan variables de entorno de Supabase" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    // ✅ Extraer ID de la URL
    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const id = parts[parts.indexOf("facturas") + 1];

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID de factura no proporcionado" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("facturas")
      .select(
        `
        id,
        numero,
        fecha_emisor,
        fecha_vencim,
        concepto,
        base_imponible,
        iva_percent,
        iva_total,
        total,
        estado,
        csv,
        json_factura,
        enlace_pdf,
        cliente_id,
        servicio,
        base,
        iva,
        via,
        created_at
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, message: "Factura no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, factura: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

