// app/api/sii/send/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sendToSii } from "@/lib/siiClient";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { facturaId } = (await request.json()) as { facturaId: string };

    // Llamamos sendToSii con un solo argumento (facturaId)
    const result = await sendToSii(facturaId);

    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Error enviando al SII" },
      { status: 500 }
    );
  }
}
