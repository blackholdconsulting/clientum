// utils/signFacturae.ts
import forge from "node-forge";
import { SignedXml } from "xml-crypto";

export function signFacturaeXML(xml: string, p12Buffer: Buffer, password: string): string {
  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  const keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
  const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
  const privateKey = forge.pki.privateKeyToPem(keyObj.key);
  const certificate = forge.pki.certificateToPem(certObj.cert);

  const sig = new SignedXml();
  sig.addReference("//*[local-name(.)='Facturae']");
  sig.signingKey = privateKey;
  sig.keyInfoProvider = {
    getKeyInfo: () => `<X509Data><X509Certificate>${certificate}</X509Certificate></X509Data>`,
  };
  sig.computeSignature(xml);
  return sig.getSignedXml();
}
