// app/api/facturas/sign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { signXMLFacturae } from "@/lib/xmlSigner";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  // Antes hacíamos: const { data: session } = ...
  // Ahora extraemos session correctamente de dentro de data:
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // Si no hay usuario loggeado, redirige al login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { xml } = (await request.json()) as { xml: string };

  let signed: string;
  try {
    signed = signXMLFacturae(xml);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Error al firmar XML: " + err.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, signed });
}
