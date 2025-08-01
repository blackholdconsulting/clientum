import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const data = await req.formData();
  const file = data.get("certificado") as File;
  const password = data.get("password") as string;
  const userId = data.get("userId") as string;

  if (!file || !password || !userId) {
    return NextResponse.json({ success: false, message: "Datos incompletos" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await supabase.from("certificados").upsert(
    {
      user_id: userId,
      certificado: buffer,
      password,
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ success: true, message: "Certificado guardado correctamente" });
}
