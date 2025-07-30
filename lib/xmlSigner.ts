import fs from "fs";
import { SignedXml } from "xml-crypto";

export function signFacturaeXML(xml: string): string {
  const privateKey = fs.readFileSync("certs/private.key", "utf8");
  const publicCert = fs.readFileSync("certs/certificate.crt", "utf8");

  const sig = new SignedXml();
  sig.addReference("//*[local-name(.)='Facturae']");
  sig.signingKey = privateKey;
  sig.keyInfoProvider = {
    getKeyInfo: () => `<X509Data>${publicCert}</X509Data>`,
  };

  sig.computeSignature(xml);
  return sig.getSignedXml();
}
