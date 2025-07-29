import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([], { status: 401 });

  const { data, error } = await supabase
    .from("capex")
    .select("*")
    .eq("user_id", user.id)
    .order("fecha", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({}, { status: 401 });

  const { data, error } = await supabase
    .from("capex")
    .insert({
      user_id: user.id,
      categoria: body.categoria,
      descripcion: body.descripcion,
      monto: body.monto,
      fecha: body.fecha,
    })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
