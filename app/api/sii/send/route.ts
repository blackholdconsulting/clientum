// app/api/sii/send/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sendToSii } from "@/lib/siiClient";

export async function POST(request: Request) {
  // Inicializa el cliente de Supabase para Route Handlers
  const supabase = createRouteHandlerClient({ cookies });

  // Obtén la sesión actual
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Extrae el payload desde el request
    const { facturaId } = (await request.json()) as { facturaId: string };

    // Lógica para enviar al SII
    const result = await sendToSii(facturaId, session.user.id);

    // Devuelve el resultado
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Error enviando al SII" },
      { status: 500 }
    );
  }
}
