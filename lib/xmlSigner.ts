import { SignedXml } from "xml-crypto";
import fs from "fs";
import path from "path";

export function signXMLFacturae(xmlFactura: string): string {
  // Rutas de tus certificados en /certs
  const certPath = path.join(process.cwd(), "certs", "certificate.pem");
  const keyPath  = path.join(process.cwd(), "certs", "private-key.pem");

  const certBuffer = fs.readFileSync(certPath);
  const privateKey = fs.readFileSync(keyPath, "utf8");

  const sig = new SignedXml();
  sig.addReference("/*"); // Ajusta el XPath si necesitas firmar otro nodo
  sig.signingKey = privateKey;
  sig.keyInfoProvider = {
    getKeyInfo: () =>
      `<X509Data><X509Certificate>${certBuffer.toString()}</X509Certificate></X509Data>`,
  };

  sig.computeSignature(xmlFactura);
  return sig.getSignedXml();
}
