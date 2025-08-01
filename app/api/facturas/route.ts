import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { success: false, message: "Faltan variables de entorno de Supabase" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    const { data, error } = await supabase
      .from("facturas")
      .select("id, numero, fecha, cliente, estado, csv")
      .order("fecha", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, facturas: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
