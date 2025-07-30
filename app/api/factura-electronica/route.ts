import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { buildFacturaeXML, InvoiceData } from "@/lib/facturae";
import { signXMLFacturae } from "@/lib/xmlSigner";
import soap from "soap";

export async function POST(req: NextRequest) {
  // 1️⃣ Autenticación
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  // 2️⃣ Parse del body JSON
  let payload: InvoiceData;
  try {
    payload = (await req.json()) as InvoiceData;
  } catch {
    return NextResponse.json(
      { success: false, error: "JSON inválido" },
      { status: 400 }
    );
  }

  // 3️⃣ Genera el XML Facturae
  const xml = buildFacturaeXML(payload);

  // 4️⃣ Descarga certificado y clave del usuario en Supabase
  const bucket = supabase.storage.from("certs");
  const [{ data: certData, error: ce }, { data: keyData, error: ke }] = await Promise.all([
    bucket.download(`certificate/${user.id}.pem`),
    bucket.download(`private-key/${user.id}.pem`),
  ]);

  if (ce || ke || !certData || !keyData) {
    return NextResponse.json(
      { success: false, error: "Faltan certificados para este usuario" },
      { status: 400 }
    );
  }

  const certBuffer = Buffer.from(await certData.arrayBuffer());
  const keyBuffer = Buffer.from(await keyData.arrayBuffer());

  // 5️⃣ Firma el XML
  let signedXml: string;
  try {
    signedXml = signXMLFacturae(xml, certBuffer, keyBuffer);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Error al firmar XML: " + err.message },
      { status: 500 }
    );
  }

  // 6️⃣ Envía a la AEAT vía SOAP
  try {
    const wsdlUrl =
      "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fe/SuministroFactEmitidas.wsdl";
    const client = await soap.createClientAsync(wsdlUrl);

    client.setSecurity(
      new soap.ClientSSLSecurity(certBuffer, keyBuffer, { strictSSL: false })
    );

    const args = {
      SuministroLRFacturasEmitidas: {
        Cabecera: {
          IDVersionSii: "1.1",
          Titular: {
            NombreRazon: payload.emisor?.nombre || payload.issuerName,
            NIF: payload.emisor?.nif || payload.issuerNIF,
          },
        },
        RegistroLRFacturasEmitidas: [
          {
            PeriodoLiquidacion: {
              Ejercicio: new Date().getFullYear().toString(),
              Periodo:
                (new Date().getMonth() + 1).toString().padStart(2, "0"),
            },
            FacturaExpedida: signedXml,
          },
        ],
      },
    };

    const [result] = await client.SuministroFactEmitidasAsync(args);
    return NextResponse.json({ success: true, response: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "SOAP AEAT error: " + err.message },
      { status: 500 }
    );
  }
}
