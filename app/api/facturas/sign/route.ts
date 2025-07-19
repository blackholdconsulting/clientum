// app/api/facturas/sign/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { signXMLForUser } from "@/lib/xmlSigner";

export async function POST(request: Request) {
  // Inicializa el cliente de Supabase para Route Handlers
  const supabase = createRouteHandlerClient({ cookies });

  // Obtén la sesión del usuario
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    );
  }

  try {
    const { xmlToSign } = await request.json();
    // signXMLForUser espera el XML y el userId
    const signedXml = await signXMLForUser(xmlToSign, session.user.id);

    return NextResponse.json({ signedXml });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Error firmando XML" },
      { status: 500 }
    );
  }
}
