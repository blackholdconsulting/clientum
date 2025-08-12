// lib/facturae.ts
import { create } from 'xmlbuilder2'
import { Invoice } from './invoice'

export function buildFacturae322(i: Invoice) {
  const version = process.env.FACTURAE_VERSION ?? '3.2.2'
  const root = {
    'fe:Facturae': {
      '@xmlns:fe':'http://www.facturae.es/Facturae/2009/v3.2.2/Facturae',
      '@xmlns:ds':'http://www.w3.org/2000/09/xmldsig#',
      'fe:FileHeader': {
        'fe:SchemaVersion': version,
        'fe:Modality': 'I',
        'fe:InvoiceIssuerType': 'EM',
        'fe:Batch': {
          'fe:BatchIdentifier': i.number,
          'fe:InvoicesCount': 1,
          'fe:TotalInvoicesAmount': { 'fe:TotalAmount': i.total.toFixed(2) },
          'fe:TotalOutstandingAmount': { 'fe:TotalAmount': i.total.toFixed(2) },
          'fe:TotalExecutableAmount': { 'fe:TotalAmount': i.total.toFixed(2) },
          'fe:InvoiceCurrencyCode': i.currency ?? 'EUR'
        }
      },
      'fe:Parties': {
        'fe:SellerParty': partyNode(i.seller),
        'fe:BuyerParty' : partyNode(i.buyer)
      },
      'fe:Invoices': { 'fe:Invoice': invoiceNode(i) }
    }
  }
  return create(root).end({ headless:true, newline:'\n' })
}

function partyNode(p: any) {
  return {
    'fe:TaxIdentification': {
      'fe:PersonTypeCode': 'J',         // cambia a 'F' si persona física
      'fe:ResidenceTypeCode': 'R',
      'fe:TaxIdentificationNumber': p.nif
    },
    'fe:LegalEntity': {
      'fe:CorporateName': p.name,
      'fe:AddressInSpain': {
        'fe:Address': p.address,
        'fe:PostCode': p.zip,
        'fe:Town': p.city,
        'fe:Province': p.province,
        'fe:CountryCode': p.country
      }
    }
  }
}

function invoiceNode(i: Invoice) {
  const taxes = i.taxes.map(t => ({
    'fe:Tax': {
      'fe:TaxTypeCode': '01',  // IVA
      'fe:TaxRate': t.rate.toFixed(2),
      'fe:TaxableBase': { 'fe:TotalAmount': t.base.toFixed(2) },
      'fe:TaxAmount': { 'fe:TotalAmount': t.quota.toFixed(2) }
    }
  }))

  const lines = i.items.map((it, idx) => ({
    'fe:InvoiceLine': {
      'fe:ItemDescription': it.description,
      'fe:Quantity': it.quantity,
      'fe:UnitPriceWithoutTax': it.unitPrice.toFixed(6),
      'fe:Tax': { 'fe:TaxTypeCode': '01', 'fe:TaxRate': it.taxRate.toFixed(2) },
      'fe:LineItemAmount': (it.quantity * it.unitPrice).toFixed(2),
      'fe:ShortDescription': `L${idx+1}`
    }
  }))

  return {
    'fe:InvoiceHeader': {
      'fe:InvoiceNumber': i.number,
      'fe:InvoiceSeriesCode': i.series ?? '',
      'fe:InvoiceDocumentType': 'FC',
      'fe:InvoiceClass': 'OO'
    },
    'fe:InvoiceIssueData': {
      'fe:IssueDate': i.issueDate,
      'fe:InvoiceCurrencyCode': i.currency ?? 'EUR',
    },
    'fe:TaxesOutputs': taxes,
    'fe:InvoiceTotals': {
      'fe:TotalGrossAmount': i.total.toFixed(2),
      'fe:TotalGeneralDiscounts': { 'fe:TotalAmount': '0.00' },
      'fe:TotalGeneralSurcharges': { 'fe:TotalAmount': '0.00' },
      'fe:TotalTaxOutputs': i.taxes.reduce((s,t)=>s+t.quota,0).toFixed(2),
      'fe:TotalTaxesWithheld': '0.00',
      'fe:InvoiceTotal': i.total.toFixed(2)
    },
    'fe:Items': lines
  }
}
