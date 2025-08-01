// app/api/usuario/perfil/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET() {
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

  const { data: perfil, error } = await supabase
    .from("perfil")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, perfil });
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

  const payload = {
    user_id: user.id,
    nombre: body.nombre,
    apellidos: body.apellidos,
    telefono: body.telefono,
    idioma: body.idioma,
    nombre_empresa: body.nombre_empresa,
    nif: body.nif,
    direccion: body.direccion,
    ciudad: body.ciudad,
    provincia: body.provincia,
    cp: body.cp,
    pais: body.pais,
    email: body.email,
    web: body.web,
    firma: body.firma,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("perfil")
    .upsert(payload, { onConflict: "user_id" })
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, perfil: data });
}
