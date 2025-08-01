import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  // Recupera el usuario logueado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { success: false, error: userError?.message || "Usuario no autenticado" },
      { status: 401 }
    );
  }

  // Lee el perfil de la tabla 'perfil' (ajusta el nombre de la tabla si difiere)
  const { data: perfil, error } = await supabase
    .from("perfil")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, perfil });
}

export async function POST(req: Request) {
  const body = await req.json();

  // Recupera el usuario logueado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { success: false, error: userError?.message || "Usuario no autenticado" },
      { status: 401 }
    );
  }

  // Construye el payload con TODOS los campos que envía el cliente
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
    firma,            // ¡ahora guardamos también la firma Base64!
    updated_at: new Date().toISOString(),
  };

  // Inserta o actualiza (upsert) la fila en la tabla 'perfil'
  const { data, error } = await supabase
    .from("perfil")
    .upsert(payload, { onConflict: "user_id" })
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, perfil: data });
}
