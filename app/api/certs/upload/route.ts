import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string; // "certificate" o "private-key"

  if (!file || !type) {
    return NextResponse.json({ error: "Archivo o tipo faltante" }, { status: 400 });
  }

  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const filePath = `${type}/${user.data.user.id}.pem`;
  const { error } = await supabase.storage.from("certs").upload(filePath, file, {
    upsert: true,
    contentType: "application/x-pem-file",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
