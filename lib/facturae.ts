import { Builder } from "xml2js";

export interface InvoiceParty {
  nombre: string;
  nif?: string;
  cif?: string;        // ✅ Nuevo campo
  direccion?: string;
  cp?: string;
  ciudad?: string;
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

  // Nuevos campos para compatibilidad
  emisor?: InvoiceParty;
  receptor?: InvoiceParty;
}

export function generateFacturaeXML(data: InvoiceData): string {
  const builder = new Builder({ headless: true });

  const issuerName = data.emisor?.nombre || data.issuerName;
  const issuerNIF = data.emisor?.nif || data.emisor?.cif || data.issuerNIF;
  const receiverName = data.receptor?.nombre || data.receiverName;
  const receiverNIF = data.receptor?.nif || data.receptor?.cif || data.receiverNIF;

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
            InvoiceLine: {
              ItemDescription: data.concept,
              Quantity: 1,
              UnitPriceWithoutTax: data.baseAmount,
              TotalCost: data.baseAmount,
              TaxesOutputs: {
                Tax: {
                  TaxTypeCode: "01",
                  TaxRate: data.vat,
                  TaxableBase: { TotalAmount: data.baseAmount },
                  TaxAmount: { TotalAmount: (data.baseAmount * data.vat) / 100 },
                },
              },
            },
          },
          InvoiceTotals: {
            TotalGrossAmount: data.baseAmount,
            TotalTaxOutputs: (data.baseAmount * data.vat) / 100,
            InvoiceTotal: data.totalAmount,
          },
        },
      },
    },
  };

  return builder.buildObject(xmlObj);
}

export { generateFacturaeXML as buildFacturaeXML };
export type { InvoiceData as FacturaeData };
