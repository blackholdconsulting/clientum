import { SignedXml } from "xml-crypto";
import fs from "fs";
import path from "path";

export function signXMLForUser(xmlFactura: string): string {
  // Ruta de los certificados dentro de /certs
  const certPath = path.join(process.cwd(), "certs", "certificate.pem");
  const keyPath  = path.join(process.cwd(), "certs", "private-key.pem");

  // Leemos los ficheros
  const certBuffer = fs.readFileSync(certPath);
  const privateKey = fs.readFileSync(keyPath).toString();

  // Preparar firma
  const sig = new SignedXml();
  sig.addReference("/*"); // Ajusta el XPath según el esquema de Facturae
  sig.signingKey = privateKey;
  sig.keyInfoProvider = {
    getKeyInfo: () =>
      `<X509Data><X509Certificate>${certBuffer.toString()}</X509Certificate></X509Data>`,
  };

  sig.computeSignature(xmlFactura);
  return sig.getSignedXml();
}
