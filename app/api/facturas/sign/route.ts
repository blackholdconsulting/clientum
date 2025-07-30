import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { signXMLFacturae } from "@/lib/xmlSigner";

export async function POST(request: NextRequest) {
  // Inicializa Supabase
  const supabase = createRouteHandlerClient({ cookies });
  const { data: session } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.redirect("/auth/login");

  const { xml } = (await request.json()) as { xml: string };
  const signed = signXMLFacturae(xml);
  return NextResponse.json({ signed });
}
