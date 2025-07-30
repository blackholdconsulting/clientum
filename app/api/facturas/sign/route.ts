import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { signFacturaeXML as signXMLForUser } from "@/lib/xmlSigner";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const xml = await request.text();

  try {
    const signedXML = signXMLForUser(xml);
    return new Response(signedXML, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
