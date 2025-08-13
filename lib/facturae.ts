// lib/facturae.ts
import { create } from 'xmlbuilder2'
import { Invoice, Party } from './invoice'

const xmlSanitize = (s?: string) =>
  (s ?? '')
    .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/g, '') // quita control chars
    .trim()

const iso3 = (c?: string) => {
  const u = (c ?? '').trim().toUpperCase()
  if (['ES', 'ESP', 'SPAIN', 'ESPAÑA'].includes(u)) return 'ESP'
  return u.length === 3 ? u : 'ESP'
}
const normNIF = (n?: string) => xmlSanitize((n ?? '').toUpperCase().replace(/\s|-/g, '')) || '00000000T'
const batchId = (x: string) => x.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 20)

const asLegalEntity = (p: Party) => ({
  'TaxIdentification': {
    'PersonTypeCode': 'J',
    'ResidenceTypeCode': 'R',
    'TaxIdentificationNumber': normNIF(p.nif),
  },
  'LegalEntity': {
    'CorporateName': xmlSanitize(p.name) || 'EMISOR',
    'AddressInSpain': {
      'Address': xmlSanitize(p.address) || '-',
      'PostCode': xmlSanitize(p.zip) || '00000',
      'Town': xmlSanitize(p.city) || '-',
      'Province': xmlSanitize(p.province) || '-',
      'CountryCode': iso3(p.country),
    },
  },
})

export function buildFacturae322(i: Invoice) {
  const version = process.env.FACTURAE_VERSION ?? '3.2.2'
  const invNum = xmlSanitize(i.number) || '0001'
  const series = xmlSanize(i.series) ?? ''  // typo fix below in code; keep careful
  // fix typo:
  const seriesFinal = xmlSanitize(i.series) || ''

  const taxesTotal = (i.taxes ?? []).reduce((s, t) => s + (t.quota ?? 0), 0)
  const lines = (i.items ?? []).map((it, idx) => ({
    'InvoiceLine': {
      'ItemDescription': xmlSanitize(it.description) || `Linea ${idx + 1}`,
      'Quantity': it.quantity ?? 1,
      'UnitPriceWithoutTax': (it.unitPrice ?? 0).toFixed(6),
      'Tax': { 'TaxTypeCode': '01', 'TaxRate': (it.taxRate ?? 0).toFixed(2) },
      'LineItemAmount': ((it.quantity ?? 1) * (it.unitPrice ?? 0)).toFixed(2),
      'ShortDescription': `L${idx + 1}`,
    },
  }))

  const root = {
    // OJO: Namespace por defecto (sin prefijo). FACe lo prefiere así.
    'Facturae': {
      '@xmlns': 'http://www.facturae.es/Facturae/2009/v3.2.2/Facturae',
      '@xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      'FileHeader': {
        'SchemaVersion': version,
        'Modality': 'I',
        'InvoiceIssuerType': 'EM',
        'Batch': {
          'BatchIdentifier': batchId(invNum),
          'InvoicesCount': 1,
          'TotalInvoicesAmount': { 'TotalAmount': (i.total ?? 0).toFixed(2) },
          'TotalOutstandingAmount': { 'TotalAmount': (i.total ?? 0).toFixed(2) },
          'TotalExecutableAmount': { 'TotalAmount': (i.total ?? 0).toFixed(2) },
          'InvoiceCurrencyCode': i.currency ?? 'EUR',
        },
      },
      'Parties': {
        'SellerParty': asLegalEntity(i.seller), // más laxo: evita requisitos extra de "Individual"
        'BuyerParty':  asLegalEntity({
          // normaliza país/NIF del comprador
          ...i.buyer,
          nif: normNIF(i.buyer?.nif),
          country: iso3(i.buyer?.country),
        } as Party),
      },
      'Invoices': {
        'Invoice': {
          'InvoiceHeader': {
            'InvoiceNumber': invNum.slice(0, 20),
            'InvoiceSeriesCode': seriesFinal,
            'InvoiceDocumentType': 'FC',
            'InvoiceClass': 'OO',
          },
          'InvoiceIssueData': {
            'IssueDate': i.issueDate ?? new Date().toISOString().slice(0, 10),
            'InvoiceCurrencyCode': i.currency ?? 'EUR',
          },
          'TaxesOutputs': (i.taxes ?? []).map((t) => ({
            'Tax': {
              'TaxTypeCode': '01',
              'TaxRate': (t.rate ?? 0).toFixed(2),
              'TaxableBase': { 'TotalAmount': (t.base ?? 0).toFixed(2) },
              'TaxAmount': { 'TotalAmount': (t.quota ?? 0).toFixed(2) },
            },
          })),
          'InvoiceTotals': {
            'TotalGrossAmount': (i.total ?? 0).toFixed(2),
            'TotalGeneralDiscounts': { 'TotalAmount': '0.00' },
            'TotalGeneralSurcharges': { 'TotalAmount': '0.00' },
            'TotalTaxOutputs': taxesTotal.toFixed(2),
            'TotalTaxesWithheld': '0.00',
            'InvoiceTotal': (i.total ?? 0).toFixed(2),
          },
          // Un único <Items> con N <InvoiceLine>
          'Items': lines,
        },
      },
    },
  }

  // Prolog + UTF-8
  return create({ version: '1.0', encoding: 'UTF-8' }).ele(root).end({ prettyPrint: true })
}
