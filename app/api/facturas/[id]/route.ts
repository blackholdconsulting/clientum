import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Obtener factura por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, factura: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}

// Actualizar estado o campos de la factura
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    const body = await request.json();
    const { estado, ...otrosCampos } = body;

    const { data, error } = await supabase
      .from("facturas")
      .update({ estado, ...otrosCampos })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Factura actualizada correctamente",
      factura: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
