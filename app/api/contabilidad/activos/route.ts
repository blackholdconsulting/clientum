// app/api/contabilidad/activos/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET(request: Request) {
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

  const { data: activos, error } = await query.order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, activos });
}

export async function POST(request: Request) {
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

  if (!body.nombre || !body.codigo || !body.grupo) {
    return NextResponse.json(
      { success: false, error: "Faltan campos obligatorios" },
      { status: 400 }
    );
  }

  const payload = {
    user_id: user.id,
    nombre: body.nombre,
    codigo: body.codigo,
    grupo: body.grupo,
    valor: body.valor,
    amortizacion: body.amortizacion,
    saldo: body.valor,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("activos")
    .insert(payload)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, activo: data });
}
