// lib/xmlSigner.ts
import { SignedXml } from "xml-crypto";
import fs from "fs";
import path from "path";

// Ajusta la ruta a tus certificados
const KEY_PATH = path.resolve(process.cwd(), "certs", "private-key.pem");
const CERT_PATH = path.resolve(process.cwd(), "certs", "certificate.pem");

const privateKeyPem = fs.readFileSync(KEY_PATH, "utf-8");
const certPem = fs.readFileSync(CERT_PATH, "utf-8");

export async function signXMLForUser(xml: string, userId: string): Promise<string> {
  // Inicializa SignedXml con privateKey y publicCert
  const sig = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certPem,
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
  });

  // Asignamos keyInfoProvider usando un cast a any
  (sig as any).keyInfoProvider = {
    getKeyInfo() {
      const certBase64 = certPem
        .replace(/-----BEGIN CERTIFICATE-----/, "")
        .replace(/-----END CERTIFICATE-----/, "")
        .replace(/\r?\n|\r/g, "");
      return `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`;
    },
    getKey() {
      return privateKeyPem;
    },
  };

  // Añade la referencia al nodo raíz
  sig.addReference({
    xpath: "/*",
    transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });

  // Calcula la firma
  sig.computeSignature(xml, {
    prefix: "ds",
    attrs: { xmlns: "http://www.w3.org/2000/09/xmldsig#" },
  });

  // Devuelve el XML firmado
  return sig.getSignedXml();
}
