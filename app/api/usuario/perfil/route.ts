import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  // 1. Autenticación
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

  // 2. Leer perfil
  const { data: perfil, error: selectError } = await supabase
    .from("perfil")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (selectError) {
    return NextResponse.json(
      { success: false, error: selectError.message },
      { status: 500 }
    );
  }

  // 3. Devolver perfil
  return NextResponse.json({ success: true, perfil });
}

export async function POST(request: Request) {
  const body = await request.json();

  // 1. Autenticación
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

  // 2. Extraer campos del body
  const {
    nombre,
    apellidos,
    telefono,
    idioma,
    nombre_empresa,
    nif,
    direccion,
    ciudad,
    provincia,
    cp,
    pais,
    email,
    web,
    firma,
  } = body;

  // 3. Upsert en la tabla "perfil"
  const payload = {
    user_id: user.id,
    nombre,
    apellidos,
    telefono,
    idioma,
    nombre_empresa,
    nif,
    direccion,
    ciudad,
    provincia,
    cp,
    pais,
    email,
    web,
    firma,
    updated_at: new Date().toISOString(),
  };

  const { data, error: upsertError } = await supabase
    .from("perfil")
    .upsert(payload, { onConflict: "user_id" })
    .single();

  if (upsertError) {
    return NextResponse.json(
      { success: false, error: upsertError.message },
      { status: 500 }
    );
  }

  // 4. Siempre devolvemos JSON con éxito
  return NextResponse.json({ success: true, perfil: data });
}
