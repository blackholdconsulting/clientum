import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .order("fecha_emisor", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, facturas: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Error desconocido" },
      { status: 500 }
    );
  }
}
