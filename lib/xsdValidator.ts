// lib/xsdValidator.ts

/**
 * Stub de validación XSD.
 * Siempre devuelve válido.
 */
export async function validateXmlAgainstXsd(
  _xml: string,
  _xsdPath: string
): Promise<{ valid: boolean; errors: string[] }> {
  return { valid: true, errors: [] }
}
