import { NextRequest, NextResponse } from "next/server";
import { buildFacturaeXML, InvoiceData } from "@/lib/facturae";
import { signXMLFacturae } from "@/lib/xmlSigner";
import soap from "soap";

export async function POST(req: NextRequest) {
  const data = (await req.json()) as InvoiceData;
  const xml  = buildFacturaeXML(data);

  let signedXml: string;
  try {
    signedXml = signXMLFacturae(xml);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Error al firmar XML: " + err.message },
      { status: 500 }
    );
  }

  // WSDL de preproducción AEAT (ajusta si cambias de entorno)
  const wsdlUrl =
    "https://prewww1.aeat.es/static_files/common/internet/dep/explotacion/ws/ClienteWSAEAT_OPC.html?OPC=/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/opciones.js";

  const client = await soap.createClientAsync(wsdlUrl);
  const [res] = await client.AltaFacturaAsync({ xml: signedXml });

  return NextResponse.json({ success: true, response: res });
}
