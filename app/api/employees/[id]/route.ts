// app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function PATCH(req: NextRequest, { params }) {
  const supabase = createServerComponentClient({ cookies });
  const { first_name, last_name, email, position, salary } = await req.json();

  const { data, error } = await supabase
    .from("employees")
    .update({ first_name, last_name, email, position, salary })
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }) {
  const supabase = createServerComponentClient({ cookies });
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
