import { Builder } from "xml2js";

export interface InvoiceParty {
  nombre: string;
  nif?: string;
  cif?: string;
  direccion?: string;
  cp?: string;
  ciudad?: string;
}

// ✅ Flexibilidad en nombres de campos
export interface InvoiceLine {
  descripcion?: string;
  description?: string;
  cantidad?: number;
  qty?: number;
  precioUnitario?: number;
  unitPrice?: number;
}

export interface InvoiceData {
  issuerName: string;
  issuerNIF: string;
  receiverName: string;
  receiverNIF: string;
  invoiceNumber: string;
  invoiceDate: string;
  concept: string;
  baseAmount: number;
  vat: number;
  totalAmount: number;

  // Campos opcionales
  serie?: string;
  numero?: string;
  fecha?: string;
  vencimiento?: string;

  // Nuevos campos
  emisor?: InvoiceParty;
  receptor?: InvoiceParty;
  lineas?: InvoiceLine[];
  iva?: number;
  irpf?: number;
}

export function generateFacturaeXML(data: InvoiceData): string {
  const builder = new Builder({ headless: true });

  const issuerName = data.emisor?.nombre || data.issuerName;
  const issuerNIF = data.emisor?.nif || data.emisor?.cif || data.issuerNIF;
  const receiverName = data.receptor?.nombre || data.receiverName;
  const receiverNIF = data.receptor?.nif || data.receptor?.cif || data.receiverNIF;

  // Calcular subtotal con flexibilidad en nombres
  const subtotal = data.lineas
    ? data.lineas.reduce((acc, l) => {
        const qty = l.cantidad ?? l.qty ?? 1;
        const price = l.precioUnitario ?? l.unitPrice ?? 0;
        return acc + price * qty;
      }, 0)
    : data.baseAmount;

  const iva = data.iva ?? data.vat;
  const totalIVA = (subtotal * iva) / 100;
  const totalAmount = subtotal + totalIVA - (data.irpf ?? 0);

  const xmlObj = {
    Facturae: {
      FileHeader: {
        SchemaVersion: "3.2.2",
        Modality: "I",
        InvoiceIssuerType: "EM",
      },
      Parties: {
        SellerParty: {
          TaxIdentification: {
            PersonTypeCode: "J",
            ResidenceTypeCode: "R",
            TaxIdentificationNumber: issuerNIF,
          },
          LegalEntity: { CorporateName: issuerName },
        },
        BuyerParty: {
          TaxIdentification: {
            PersonTypeCode: "J",
            ResidenceTypeCode: "R",
            TaxIdentificationNumber: receiverNIF,
          },
          LegalEntity: { CorporateName: receiverName },
        },
      },
      Invoices: {
        Invoice: {
          InvoiceHeader: {
            InvoiceNumber: data.invoiceNumber || data.numero || "0001",
            InvoiceSeriesCode: data.serie || "",
            InvoiceDocumentType: "FC",
            InvoiceClass: "OO",
          },
          InvoiceIssueData: { IssueDate: data.invoiceDate || data.fecha },
          Items: {
            InvoiceLine: data.lineas
              ? data.lineas.map((l) => {
                  const qty = l.cantidad ?? l.qty ?? 1;
                  const price = l.precioUnitario ?? l.unitPrice ?? 0;
                  return {
                    ItemDescription: l.descripcion || l.description || "",
                    Quantity: qty,
                    UnitPriceWithoutTax: price,
                    TotalCost: price * qty,
                  };
                })
              : {
                  ItemDescription: data.concept,
                  Quantity: 1,
                  UnitPriceWithoutTax: data.baseAmount,
                  TotalCost: data.baseAmount,
                },
          },
          InvoiceTotals: {
            TotalGrossAmount: subtotal,
            TotalTaxOutputs: totalIVA,
            InvoiceTotal: totalAmount,
          },
        },
      },
    },
  };

  return builder.buildObject(xmlObj);
}

export { generateFacturaeXML as buildFacturaeXML };
export type { InvoiceData as FacturaeData };
