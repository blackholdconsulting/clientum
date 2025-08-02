// app/api/contabilidad/activos/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabase
    .from("activos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { nombre, codigo, grupo, valor, amortizacion_anual } =
    await request.json();

  const { data, error } = await supabase.from("activos").insert([
    {
      user_id: supabase.auth.getUser().data.user!.id,
      nombre,
      codigo,
      grupo,
      valor,
      amortizacion_anual,
    },
  ]);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
