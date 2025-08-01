// lib/sii/sendToSII.ts
import soap from "soap";
import { generateFacturaeXML } from "@/utils/facturae";
import { signFacturaeXML } from "@/utils/signFacturae";

export async function sendToSii(facturaData: any, certificado: Buffer, password: string) {
  const xml = generateFacturaeXML(facturaData);
  const signedXML = signFacturaeXML(xml, certificado, password);

  const wsdl = "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fe/SiiFactFE.wsdl";
  const client = await soap.createClientAsync(wsdl);

  const args = { xmlFactura: signedXML };
  const [result] = await client.EnviarFacturaAsync(args);

  return result;
}
