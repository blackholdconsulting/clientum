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
    .from("budget_monthly")
    .select("*")
    .eq("user_id", user.id)
    .order("categoria");

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
    .from("budget_monthly")
    .upsert(
      body.map((item: any) => ({
        user_id: user.id,
        categoria: item.categoria,
        mes: item.mes,
        gasto: item.gasto,
        presupuesto: item.presupuesto,
      }))
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
