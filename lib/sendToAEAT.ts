<<<<<<< HEAD
import fs from "fs";
import path from "path";
=======
>>>>>>> b54d036 (feat: integración AEAT con firma y envío automático)
import soap from "soap";
import { signXMLFacturae } from "./xmlSigner";

export async function sendFacturaToAEAT(
  xmlFactura: string,
  certBuffer: Buffer,
  keyBuffer: Buffer
): Promise<string> {
  try {
<<<<<<< HEAD
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
=======
    // Firmar XML con certificado del usuario
    const signedXml = signXMLFacturae(xmlFactura, certBuffer, keyBuffer);

    // Cliente SOAP
    const wsdlUrl =
      "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fe/SuministroFactEmitidas.wsdl";
    const client = await soap.createClientAsync(wsdlUrl);

    // Seguridad SSL usando buffers
    client.setSecurity(new soap.ClientSSLSecurity(certBuffer, keyBuffer, { strictSSL: false }));

    // Enviar factura
    const [result] = await client.SuministroFactEmitidasAsync({
      SuministroLRFacturasEmitidas: {
        Cabecera: {
          IDVersionSii: "1.1",
          Titular: {
            NombreRazon: "Nombre Empresa",
            NIF: "B12345678",
          },
        },
        RegistroLRFacturasEmitidas: [
          {
            PeriodoLiquidacion: {
              Ejercicio: "2025",
              Periodo: "07",
            },
            FacturaExpedida: signedXml,
          },
        ],
      },
    });

    return JSON.stringify(result);
>>>>>>> b54d036 (feat: integración AEAT con firma y envío automático)
  } catch (error: any) {
    throw new Error(error.message);
  }
}
