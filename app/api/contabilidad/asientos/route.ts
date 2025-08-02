// app/api/contabilidad/asientos/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET() {
  // 1) Obtener todos los asientos, ordenados por fecha descendente
  const { data, error } = await supabase
    .from("asiento_contable")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  // 2) Parsear el body de la petición
  const { factura_id, fecha, cuenta_id, descripcion, debe, haber } =
    await request.json();

  // 3) Obtener el usuario actual
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

  // 4) Insertar el nuevo asiento
  const { data, error } = await supabase.from("asiento_contable").insert([
    {
      user_id: user.id,
      factura_id,
      fecha,
      cuenta_id,
      descripcion,
      debe,
      haber,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
