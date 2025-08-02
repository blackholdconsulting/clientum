// app/api/asiento_contable/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("asiento_contable")
    .select("*, cuentas:cuenta_id(codigo,nombre), facturas:id(serie,numero)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const { data, error } = await supabaseServer
    .from("asiento_contable")
    .insert([{ ...payload }]);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data[0]);
}
