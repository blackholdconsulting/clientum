// app/api/contabilidad/asientos/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabase
    .from("asiento_contable")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { factura_id, fecha, cuenta_id, descripcion, debe, haber } =
    await request.json();

  const { data, error } = await supabase.from("asiento_contable").insert([
    {
      user_id: supabase.auth.getUser().data.user!.id,
      factura_id,
      fecha,
      cuenta_id,
      descripcion,
      debe,
      haber,
    },
  ]);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
