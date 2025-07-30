import fs from "fs";
import path from "path";
import soap from "soap";
import { generateFacturaeXML, InvoiceData } from "./facturae";
import { signFacturaeXML } from "./xmlSigner";

export async function sendFacturaToAEAT(invoiceData: InvoiceData) {
  try {
    const xml = generateFacturaeXML(invoiceData);
    const signedXML = signFacturaeXML(xml);

    const wsdlUrl = "https://prewww1.aeat.es/wselivfact/ws/fe/wsdl/Facturae.wsdl";

    const client = await soap.createClientAsync(wsdlUrl, {
      wsdl_options: {
        cert: fs.readFileSync(path.resolve("certs/certificate.crt")),
        key: fs.readFileSync(path.resolve("certs/private.key")),
        rejectUnauthorized: false,
      },
    });

    const args = { facturae: signedXML };
    const [result] = await client.EnviarFacturaeAsync(args);

    console.log("Respuesta AEAT:", result);
    return result;
  } catch (error: any) {
    console.error("Error enviando factura a AEAT:", error.message);
    throw new Error(error.message);
  }
}
