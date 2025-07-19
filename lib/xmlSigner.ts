// lib/xmlSigner.ts
import { SignedXml } from "xml-crypto";
import fs from "fs";
import path from "path";

// Ajusta estas rutas a donde tengas tu clave privada y certificado
const KEY_PATH = path.resolve(process.cwd(), "certs", "private-key.pem");
const CERT_PATH = path.resolve(process.cwd(), "certs", "certificate.pem");

const privateKeyPem = fs.readFileSync(KEY_PATH, "utf-8");
const certPem = fs.readFileSync(CERT_PATH, "utf-8");

export async function signXMLForUser(xml: string, userId: string): Promise<string> {
  // Creamos el objeto para la firma
  const sig = new SignedXml();

  // Algoritmos que queremos usar
  sig.signatureAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
  sig.signingKey = privateKeyPem;

  // Inyectamos el certificado en el KeyInfo
  sig.keyInfoProvider = {
    getKeyInfo() {
      // Quita las cabeceras/footers y saltos de línea
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

  // Aquí va el cambio: addReference ahora sólo recibe un objeto
  sig.addReference({
    xpath: "/*",
    transforms: [
      "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
    ],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });

  // Finalmente computamos la firma sobre el documento completo
  sig.computeSignature(xml, {
    prefix: "ds",
    attrs: { xmlns: "http://www.w3.org/2000/09/xmldsig#" },
  });

  // Devolvemos el XML ya firmado
  return sig.getSignedXml();
}
