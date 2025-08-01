import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ✅ GET - Obtener factura por ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .eq("id", id)
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

// ✅ PUT - Actualizar factura completa
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("facturas")
      .update(body)
      .eq("id", id)
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

// ✅ PATCH - Actualizar solo campos específicos
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("facturas")
      .update(body)
      .eq("id", id)
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
      message: "Campos de factura actualizados",
      factura: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
