// lib/facturae.ts
import { create } from 'xmlbuilder2'
import * as fs from 'fs'
import * as path from 'path'
import { validateXML } from './xsdValidator' // lo crearemos en el paso 3

export interface LineaFactura {
  descripcion: string
  cantidad: number
  precioUnitario: number
  tipoIVA: number
}

export interface FacturaEData {
  id: string
  serie: string
  fechaEmision: string // YYYY-MM-DD
  emisor: {
    razonSocial: string
    nif: string
    domicilio: string
    municipio: string
    provincia: string
    codigoPostal: string
  }
  receptor: {
    razonSocial: string
    nif: string
    domicilio: string
    municipio: string
    provincia: string
    codigoPostal: string
  }
  lineas: LineaFactura[]
}

export function generarFacturaE(data: FacturaEData): { xml: string; valid: boolean; errors?: string[] } {
  // Construir el XML según esquema FacturaE 3.2
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Facturae', { 
      'xmlns': 'http://www.facturae.es/Facturae/2014/v3.2/Facturae',
      'Version': '3.2.1'
    })
      .ele('FileHeader')
        .ele('SchemaVersion').txt('Facturae 3.2.1').up()
        .ele('Modality').txt('I').up() // I = Invoice
      .up()
      .ele('Parties')
        .ele('SellerParty')
          .ele('TaxRepresentativeParty').up() // si aplica
          .ele('SellerTransactionsAdminParty')
            .ele('TaxIdentification')
              .ele('PersonTypeCode').txt('J').up() // J = Persona jurídica
              .ele('TaxIdentificationNumber').txt(data.emisor.nif).up()
            .up()
            .ele('LegalEntity')
              .ele('CorporateName').txt(data.emisor.razonSocial).up()
              .ele('AddressInSpain')
                .ele('Address').txt(data.emisor.domicilio).up()
                .ele('PostCode').txt(data.emisor.codigoPostal).up()
                .ele('Town').txt(data.emisor.municipio).up()
                .ele('Province').txt(data.emisor.provincia).up()
              .up()
            .up()
          .up()
        .up()
        .ele('BuyerParty')
          .ele('TaxIdentification')
            .ele('PersonTypeCode').txt('J').up()
            .ele('TaxIdentificationNumber').txt(data.receptor.nif).up()
          .up()
          .ele('LegalEntity')
            .ele('CorporateName').txt(data.receptor.razonSocial).up()
            .ele('AddressInSpain')
              .ele('Address').txt(data.receptor.domicilio).up()
              .ele('PostCode').txt(data.receptor.codigoPostal).up()
              .ele('Town').txt(data.receptor.municipio).up()
              .ele('Province').txt(data.receptor.provincia).up()
            .up()
          .up()
        .up()
      .up()
      .ele('Invoices')
        .ele('Invoice')
          .ele('InvoiceHeader')
            .ele('InvoiceNumber').txt(`${data.serie}-${data.id}`).up()
            .ele('InvoiceIssueDate').txt(data.fechaEmision).up()
          .up()
          .ele('InvoiceLines')

  // Añadir líneas
  for (const linea of data.lineas) {
    doc.ele('InvoiceLine')
        .ele('InvoiceLineInformation')
          .ele('InvoicedQuantity', { unitCode: 'EA' }).txt(linea.cantidad.toString()).up()
          .ele('LineExtensionAmount', { currencyID: 'EUR' }).txt((linea.cantidad * linea.precioUnitario).toFixed(2)).up()
        .up()
        .ele('Product')
          .ele('ProductDescription').txt(linea.descripcion).up()
        .up()
        .ele('Price')
          .ele('UnitPriceWithoutTax').txt(linea.precioUnitario.toFixed(2)).up()
        .up()
      .up()
  }

  // Cerrar nodos
  doc.up().up()

  const xml = doc.end({ prettyPrint: true })
  // Validar contra XSD
  const xsdPath = path.resolve(process.cwd(), 'schemas', 'FacturaE_3_2_1.xsd')
  const valid = validateXML(xml, xsdPath)
  return { xml, valid }
}
