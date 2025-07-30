import { SignedXml } from "xml-crypto";
import { DOMParser } from "xmldom";

export function signXMLFacturae(xmlFactura: string, certBuffer: Buffer, keyBuffer: Buffer): string {
  const sig = new SignedXml();
  sig.signingKey = keyBuffer;

  sig.addReference("//*[local-name(.)='Facturae']", [
    "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
  ]);

  sig.keyInfoProvider = {
<<<<<<< HEAD
    getKeyInfo: () => `<X509Data>${publicCert}</X509Data>`,
=======
    getKeyInfo: () => `<X509Data><X509Certificate>${certBuffer.toString()}</X509Certificate></X509Data>`,
>>>>>>> b54d036 (feat: integración AEAT con firma y envío automático)
  };

  const doc = new DOMParser().parseFromString(xmlFactura);
  sig.computeSignature(doc);

  return sig.getSignedXml();
}
