// lib/facturae.ts
import { create } from 'xmlbuilder2'
import { Invoice, Party } from './invoice'

// Heurística muy simple para distinguir persona física (DNI/NIE) vs jurídica (CIF)
function isIndividualNif(nif?: string) {
  if (!nif) return true
  const n = nif.toUpperCase().replace(/\s|-/g, '')
  // DNI/NIE: empieza por número/X/Y/Z y termina en letra
  return /^[0-9XYZ]\d{6,7}[A-Z]$/.test(n)
}

function countryToISO3(c?: string) {
  if (!c) return 'ESP'
  const u = c.toUpperCase().trim()
  if (['ES', 'ESP', 'SPAIN', 'ESPAÑA', 'ESPA'].includes(u)) return 'ESP'
  // Si viene un nombre o código raro, forzamos ESP para evitar rechazos
  if (u.length !== 3) return 'ESP'
  return u
}

function safe(value: any, fallback = '') {
  return (value === undefined || value === null || value === '') ? fallback : value
}

function normNIF(nif?: string, fallback = '00000000T') {
  return (nif || '').toString().toUpperCase().replace(/\s|-/g, '') || fallback
}

function partyNode(p: Party) {
  const indiv = isIndividualNif(p.nif)
  const baseAddr = {
    'fe:Address': safe(p.address, '—'),
    'fe:PostCode': safe(p.zip, '00000'),
    'fe:Town': safe(p.city, '—'),
    'fe:Province': safe(p.province, '—'),
    'fe:CountryCode': countryToISO3(p.country),
  }

  const taxId = {
    'fe:PersonTypeCode': indiv ? 'F' : 'J',
    'fe:ResidenceTypeCode': 'R',
    'fe:TaxIdentificationNumber': normNIF(p.nif),
  }

  return indiv
    ? {
        'fe:TaxIdentification': taxId,
        'fe:Individual': {
          'fe:Name': safe(p.name, '—'),
          'fe:AddressInSpain': baseAddr,
        },
      }
    : {
        'fe:TaxIdentification': taxId,
        'fe:LegalEntity': {
          'fe:CorporateName': safe(p.name, '—'),
          'fe:AddressInSpain': baseAddr,
        },
      }
}

export function buildFacturae322(i: Invoice) {
  const version = process.env.FACTURAE_VERSION ?? '3.2.2'

  // Totales impuestos (por si no vienen redondeados)
  const totalTax = i.taxes.reduce((s, t) => s + (t.quota ?? 0), 0)

  const taxesOutputs = i.taxes.map((t) => ({
    'fe:Tax': {
      'fe:TaxTypeCode': '01', // IVA
      'fe:TaxRate': (t.rate ?? 0).toFixed(2),
      'fe:TaxableBase': { 'fe:TotalAmount': (t.base ?? 0).toFixed(2) },
      'fe:TaxAmount': { 'fe:TotalAmount': (t.quota ?? 0).toFixed(2) },
    },
  }))

  const invoiceLines = i.items.map((it, idx) => ({
    'fe:ItemDescription': safe(it.description, `Línea ${idx + 1}`),
    'fe:Quantity': it.quantity ?? 1,
    'fe:UnitPriceWithoutTax': (it.unitPrice ?? 0).toFixed(6),
    'fe:Tax': { 'fe:TaxTypeCode': '01', 'fe:TaxRate': (it.taxRate ?? 0).toFixed(2) },
    'fe:LineItemAmount': ((it.quantity ?? 1) * (it.unitPrice ?? 0)).toFixed(2),
    'fe:ShortDescription': `L${idx + 1}`,
  }))

  const root = {
    'fe:Facturae': {
      '@xmlns:fe': 'http://www.facturae.es/Facturae/2009/v3.2.2/Facturae',
      '@xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      'fe:FileHeader': {
        'fe:SchemaVersion': version,
        'fe:Modality': 'I',
        'fe:InvoiceIssuerType': 'EM',
        'fe:Batch': {
          'fe:BatchIdentifier': safe(i.number, `BATCH-${i.issueDate?.replaceAll('-', '') || '00000000'}`).toString().slice(0, 20),
          'fe:InvoicesCount': 1,
          'fe:TotalInvoicesAmount': { 'fe:TotalAmount': (i.total ?? 0).toFixed(2) },
          'fe:TotalOutstandingAmount': { 'fe:TotalAmount': (i.total ?? 0).toFixed(2) },
          'fe:TotalExecutableAmount': { 'fe:TotalAmount': (i.total ?? 0).toFixed(2) },
          'fe:InvoiceCurrencyCode': i.currency ?? 'EUR',
        },
      },
      'fe:Parties': {
        'fe:SellerParty': partyNode(i.seller),
        'fe:BuyerParty': partyNode({
          // aseguramos un NIF válido si falta
          ...i.buyer,
          nif: normNIF(i.buyer?.nif),
        }),
      },
      'fe:Invoices': {
        'fe:Invoice': {
          'fe:InvoiceHeader': {
            'fe:InvoiceNumber': safe(i.number, '0001').toString().slice(0, 20),
            'fe:InvoiceSeriesCode': safe(i.series, ''),
            'fe:InvoiceDocumentType': 'FC',
            'fe:InvoiceClass': 'OO',
          },
          'fe:InvoiceIssueData': {
            'fe:IssueDate': i.issueDate ?? new Date().toISOString().slice(0, 10),
            'fe:InvoiceCurrencyCode': i.currency ?? 'EUR',
          },
          'fe:TaxesOutputs': taxesOutputs,
          'fe:InvoiceTotals': {
            'fe:TotalGrossAmount': (i.total ?? 0).toFixed(2),
            'fe:TotalGeneralDiscounts': { 'fe:TotalAmount': '0.00' },
            'fe:TotalGeneralSurcharges': { 'fe:TotalAmount': '0.00' },
            'fe:TotalTaxOutputs': totalTax.toFixed(2),
            'fe:TotalTaxesWithheld': '0.00',
            'fe:InvoiceTotal': (i.total ?? 0).toFixed(2),
          },
          // *** Un solo <fe:Items> con N <fe:InvoiceLine> ***
          'fe:Items': { 'fe:InvoiceLine': invoiceLines },
        },
      },
    },
  }

  // Añadimos la declaración XML para que FACe reconozca el tipo (evita text/plain)
  const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele(root)
  return doc.end({ prettyPrint: true })
}
