import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ GET - usar la clave pública
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("facturas")
    .select("*, clientes(nombre)");

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, facturas: data });
}

// ✅ POST - usar SERVICE_KEY solo en operaciones de admin
export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const body = await request.json();
  const { data, error } = await supabase.from("facturas").insert([body]);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Factura creada", data });
}

