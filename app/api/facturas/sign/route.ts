import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { signXMLFacturae } from "@/lib/xmlSigner";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.redirect("/auth/login");

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
