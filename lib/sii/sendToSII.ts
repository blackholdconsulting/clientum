// lib/sii/sendToSII.ts
import soap from "soap";
import { generateFacturaeXML } from "@/utils/facturae";
import { signFacturaeXML } from "@/utils/signFacturae";

export async function sendToSii(
  facturaData: any,
  certificado?: Buffer,
  password?: string
) {
  // 1️⃣ Generar XML Facturae
  const xml = generateFacturaeXML(facturaData);

  // 2️⃣ Si hay certificado, firmar
  let finalXML = xml;
  if (certificado && password) {
    try {
      finalXML = signFacturaeXML(xml, certificado, password);
    } catch (error) {
      console.error("Error al firmar factura:", error);
    }
  }

  // 3️⃣ Crear cliente SOAP y enviar
  const wsdl = "https://prewww1.aeat.es/wlpl/SSII-FACT/ws/fe/SiiFactFE.wsdl";
  const client = await soap.createClientAsync(wsdl);

  const args = { xmlFactura: finalXML };

  try {
    const [result] = await client.EnviarFacturaAsync(args);

    // Analizar respuesta de la AEAT
    const estado = result?.Estado || "ENVIADA";
    const csv = result?.CSV || null;

    return {
      estado,
      csv,
      raw: result
    };
  } catch (error: any) {
    console.error("Error enviando factura a AEAT:", error);
    return {
      estado: "ERROR",
      error: error.message || String(error)
    };
  }
}
