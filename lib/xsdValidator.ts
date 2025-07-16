// lib/xsdValidator.ts
import * as libxml from 'libxmljs2'
import * as fs from 'fs'

export function validateXML(xml: string, xsdPath: string): boolean {
  const xsd = fs.readFileSync(xsdPath, 'utf-8')
  const xmlDoc = libxml.parseXml(xml)
  const xsdDoc = libxml.parseXml(xsd)
  const result = xmlDoc.validate(xsdDoc)
  if (!result) {
    console.error('Errores XSD:', xmlDoc.validationErrors)
  }
  return result
}
