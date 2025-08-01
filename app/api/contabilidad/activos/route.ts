// /app/api/contabilidad/activos/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "No autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    let query = supabase
      .from("activos")
      .select("*")
      .eq("user_id", user.id);

    if (filter !== "all") {
      query = query.eq("grupo", filter);
    }

    const { data: activos, error: selectError } = await query.order("created_at", { ascending: false });

    if (selectError) {
      return NextResponse.json(
        { success: false, error: selectError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, activos });
  } catch (err: any) {
    console.error("GET /api/contabilidad/activos error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "No autenticado" },
        { status: 401 }
      );
    }

    const { nombre, codigo, grupo, valor, amortizacion } = body;
    if (!nombre || !codigo || !grupo) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const payload = {
      user_id: user.id,
      nombre,
      codigo,
      grupo,
      valor,
      amortizacion,
      saldo: valor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error: insertError } = await supabase
      .from("activos")
      .insert(payload)
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, activo: data });
  } catch (err: any) {
    console.error("POST /api/contabilidad/activos error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
