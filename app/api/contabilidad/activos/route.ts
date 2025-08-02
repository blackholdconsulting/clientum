// app/api/contabilidad/activos/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET() {
  // 1) Traer todos los activos ordenados por fecha de creación descendentemente
  const { data, error } = await supabase
    .from("activos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  // 2) Parsear cuerpo de la petición
  const { nombre, codigo, grupo, valor, amortizacion_anual } =
    await request.json();

  // 3) Obtener usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: userError?.message || "Usuario no autenticado" },
      { status: 401 }
    );
  }

  // 4) Insertar nuevo activo
  const { data, error } = await supabase.from("activos").insert([
    {
      user_id: user.id,
      nombre,
      codigo,
      grupo,
      valor,
      amortizacion_anual,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
