import { Builder } from "xml2js";

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
}

export function generateFacturaeXML(data: InvoiceData): string {
  const builder = new Builder({ headless: true });

  const xmlObj = {
    Facturae: {
      FileHeader: {
        SchemaVersion: "3.2.2",
        Modality: "I",
        InvoiceIssuerType: "EM"
      },
      Parties: {
        SellerParty: {
          TaxIdentification: {
            PersonTypeCode: "J",
            ResidenceTypeCode: "R",
            TaxIdentificationNumber: data.issuerNIF
          },
          LegalEntity: { CorporateName: data.issuerName }
        },
        BuyerParty: {
          TaxIdentification: {
            PersonTypeCode: "J",
            ResidenceTypeCode: "R",
            TaxIdentificationNumber: data.receiverNIF
          },
          LegalEntity: { CorporateName: data.receiverName }
        }
      },
      Invoices: {
        Invoice: {
          InvoiceHeader: {
            InvoiceNumber: data.invoiceNumber,
            InvoiceSeriesCode: "",
            InvoiceDocumentType: "FC",
            InvoiceClass: "OO"
          },
          InvoiceIssueData: { IssueDate: data.invoiceDate },
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
                  TaxAmount: { TotalAmount: (data.baseAmount * data.vat) / 100 }
                }
              }
            }
          },
          InvoiceTotals: {
            TotalGrossAmount: data.baseAmount,
            TotalTaxOutputs: (data.baseAmount * data.vat) / 100,
            InvoiceTotal: data.totalAmount
          }
        }
      }
    }
  };

  return builder.buildObject(xmlObj);
}
