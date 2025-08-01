// app/api/facturas/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("facturas")
    .select("id, numero, fecha, cliente, estado")
    .order("fecha", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, message: error.message });
  }

  return NextResponse.json({ success: true, facturas: data });
}
