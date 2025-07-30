// lib/sendToAEAT.ts
import fs from "fs";
import path from "path";
import soap from "soap";
import { generateFacturaeXML, InvoiceData } from "./facturae";
import { signFacturaeXML } from "./xmlSigner";

export async function sendFacturaToAEAT(invoiceData: InvoiceData) {
  try {
    // 1️⃣ Generar XML
    const xml = generateFacturaeXML(invoiceData);

    // 2️⃣ Firmar XML
    const signedXML = signFacturaeXML(xml);

    // 3️⃣ Ruta del WSDL (pruebas)
    const wsdlUrl = "https://prewww1.aeat.es/wselivfact/ws/fe/wsdl/Facturae.wsdl";

    // 4️⃣ Crear cliente SOAP
    const client = await soap.createClientAsync(wsdlUrl, {
      wsdl_options: {
        cert: fs.readFileSync(path.resolve("certs/certificate.crt")),
        key: fs.readFileSync(path.resolve("certs/private.key")),
        rejectUnauthorized: false,
      },
    });

    // 5️⃣ Argumentos SOAP
    const args = {
      facturae: signedXML,
    };

    // 6️⃣ Llamar al método de envío
    const [result] = await client.EnviarFacturaeAsync(args);

    console.log("Respuesta AEAT:", result);
    return result;
  } catch (error: any) {
    console.error("Error enviando factura a AEAT:", error.message);
    throw new Error(error.message);
  }
}
