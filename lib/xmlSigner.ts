// lib/xmlSigner.ts
import { SignedXml } from "xml-crypto";
import fs from "fs";
import path from "path";

// Ajusta estas rutas si tus certificados están en otra carpeta
const KEY_PATH = path.resolve(process.cwd(), "certs", "private-key.pem");
const CERT_PATH = path.resolve(process.cwd(), "certs", "certificate.pem");

const privateKeyPem = fs.readFileSync(KEY_PATH, "utf-8");
const certPem = fs.readFileSync(CERT_PATH, "utf-8");

export async function signXMLForUser(xml: string, userId: string): Promise<string> {
  // Creamos el SignedXml pasando la clave privada y el certificado público
  const sig = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certPem,
    signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
  });

  // Proveedor de KeyInfo para inyectar el certificado en el XML
  sig.keyInfoProvider = {
    getKeyInfo() {
      const certBase64 = certPem
        .replace(/-----BEGIN CERTIFICATE-----/, "")
        .replace(/-----END CERTIFICATE-----/, "")
        .replace(/\r?\n|\r/g, "");
      return `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`;
    },
    getKey() {
      // El SignedXml constructor ya tiene la privateKey, 
      // pero xml-crypto necesita este método para verificar.
      return privateKeyPem;
    },
  };

  // Añadimos la referencia al nodo raíz, con su transformación y algoritmo de digest
  sig.addReference({
    xpath: "/*",
    transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"],
    digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  });

  // Computamos la firma, indicando el prefijo y atributos a usar
  sig.computeSignature(xml, {
    prefix: "ds",
    attrs: { xmlns: "http://www.w3.org/2000/09/xmldsig#" },
  });

  // Devolvemos el XML firmado
  return sig.getSignedXml();
}
