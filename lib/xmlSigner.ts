import fs from "fs";
import path from "path";
import { SignedXml } from "xml-crypto";

export function signXMLFacturae(xmlFactura: string): string {
  // Ajusta estas rutas si tu carpeta de certs cambia
  const certPath = path.join(process.cwd(), "certs", "certificate.pem");
  const keyPath  = path.join(process.cwd(), "certs", "private-key.pem");

  const certBuffer = fs.readFileSync(certPath);
  const privateKey = fs.readFileSync(keyPath, "utf8");

  const sig = new SignedXml();
  sig.addReference("/*"); // firma todo el documento
  sig.signingKey = privateKey;
  sig.keyInfoProvider = {
    getKeyInfo: () =>
      `<X509Data><X509Certificate>${certBuffer.toString()}</X509Certificate></X509Data>`,
  };

  sig.computeSignature(xmlFactura);
  return sig.getSignedXml();
}
