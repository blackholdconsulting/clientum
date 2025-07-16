// lib/siiClient.ts
import { createClientAsync } from 'strong-soap';
import fs from 'fs';
import path from 'path';

const wsdlUrl  = process.env.SII_WSDL_URL!;
const wsUser   = process.env.SII_USERNAME!;
const wsPass   = process.env.SII_PASSWORD!;

/**
 * Envía un XML firmado al SII
 * @param signedXml El XML firmado (FacturaE + Signature)
 */
export async function sendToSii(signedXml: string) {
  // Creamos el cliente SOAP
  const [client] = await createClientAsync(wsdlUrl, {});
  // Autenticación WS-Security
  client.setSecurity(new client.wsSecurity(wsUser, wsPass, { hasTimeStamp: false }));

  // Construimos la petición según el método (p.ej. RecepcionFactura)
  const args = {
    xml: signedXml
  };

  // Invocamos al método
  const [result] = await client.RecepcionFacturaAsync(args);
  // result tendrá algo como {ResultadoLineaFactura: {...}, CabeceraRespuesta: {...}}
  return result;
}
