import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Autenticación
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

    // Leer perfil
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

    // Responder perfil
    return NextResponse.json({ success: true, perfil });
  } catch (err: any) {
    console.error("Error en GET /perfil:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Autenticación
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

    // Extraer campos
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

    // Upsert perfil
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

    // Respuesta exitosa
    return NextResponse.json({ success: true, perfil: data });
  } catch (err: any) {
    console.error("Error en POST /perfil:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
