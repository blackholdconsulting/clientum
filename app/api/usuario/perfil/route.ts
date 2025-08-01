import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id"); // o desde auth
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, perfil: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
