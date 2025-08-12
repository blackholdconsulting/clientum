// lib/invoice.ts
export type TaxLine = { rate: number; base: number; quota: number }
export type InvoiceItem = { description: string; quantity: number; unitPrice: number; taxRate: number }
export type Party = { name: string; nif: string; address: string; zip: string; city: string; province: string; country: string }

export type Invoice = {
  id: string
  orgId: string
  number: string
  series?: string
  issueDate: string
  issueTime?: string
  seller: Party
  buyer: Party
  items: InvoiceItem[]
  taxes: TaxLine[]
  currency?: string
  total: number
}
