// app/api/asiento_contable/route.ts

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("asiento_contable")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ asientos: data });
}

export async function POST(request: Request) {
  const {
    user_id,
    factura_id,
    fecha,
    cuenta_id,
    descripcion,
    debe,
    haber,
  } = await request.json();

  const { error } = await supabaseServer
    .from("asiento_contable")
    .insert([
      { user_id, factura_id, fecha, cuenta_id, descripcion, debe, haber },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 201 });
}
