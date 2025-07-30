import { NextRequest, NextResponse } from "next/server";
import { buildFacturaeXML, InvoiceData } from "@/lib/facturae";
import { signXMLFacturae } from "@/lib/xmlSigner";
import soap from "soap";

export async function POST(req: NextRequest) {
  const data = (await req.json()) as InvoiceData;
  const xml = buildFacturaeXML(data);
  const signedXml = signXMLFacturae(xml);

  // URL WSDL de AEAT, ajusta según entorno
  const wsdlUrl = "https://prewww1.aeat.es/.../ClienteWSAEAT_OPC?wsdl";

  const client = await soap.createClientAsync(wsdlUrl);
  // Lógica de llamada, por ejemplo:
  const [res] = await client.AltaFacturaAsync({ xml: signedXml });
  return NextResponse.json(res);
}
