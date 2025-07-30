import soap from "soap";
import fs from "fs";
import path from "path";
import { signXMLFacturae } from "./xmlSigner";

export async function sendFacturaToAEAT(xmlFactura: string, certBuffer: Buffer, keyBuffer: Buffer): Promise<string> {
  // 1️⃣ Firma el XML
  const signedXml = signXMLFacturae(xmlFactura);

  // 2️⃣ Crea cliente SOAP apuntando al WSDL de preproducción AEAT
  const wsdlUrl =
    "https://prewww1.aeat.es/static_files/common/internet/dep/explotacion/ws/ClienteWSAEAT_OPC.html?OPC=/static_files/common/internet/dep/aplicaciones/es/aeat/tikeV1.0/cont/ws/opciones.js";
  const client = await soap.createClientAsync(wsdlUrl);

  // 3️⃣ Configura SSL con los buffers de certificado y clave
  client.setSecurity(
    new soap.ClientSSLSecurity(certBuffer, keyBuffer, { strictSSL: false })
  );

  // 4️⃣ Llama al método SOAP (ajusta el nombre si es distinto)
  const [result] = await client.AltaFacturaAsync({ xml: signedXml });

  return JSON.stringify(result);
}
