// app/api/contabilidad/asientos/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("asiento_contable")
    .select(`
      id,
      factura,
      fecha,
      cuenta:cuentas(nombre),
      descripcion,
      debe,
      haber
    `)
    .order("fecha", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabaseServer
    .from("asiento_contable")
    .insert([body])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0], { status: 201 });
}
