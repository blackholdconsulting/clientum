import { Builder } from "xml2js";

export interface InvoiceParty {
  nombre: string;
  nif?: string;
  cif?: string;
  direccion?: string;
  cp?: string;
  ciudad?: string;
}

export interface InvoiceLine {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
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
  lineas?: InvoiceLine[];   // ✅ Nuevo campo
  iva?: number;             // ✅ Nuevo campo
  irpf?: number;            // ✅ Nuevo campo
}

export function generateFacturaeXML(data: InvoiceData): string {
  const builder = new Builder({ headless: true });

  const issuerName = data.emisor?.nombre || data.issuerName;
  const issuerNIF = data.emisor?.nif || data.emisor?.cif || data.issuerNIF;
  const receiverName = data.receptor?.nombre || data.receiverName;
  const receiverNIF = data.receptor?.nif || data.receptor?.cif || data.receiverNIF;

  // Calcular totales a partir de las líneas
  const subtotal = data.lineas
    ? data.lineas.reduce((acc, l) => acc + l.precioUnitario * l.cantidad, 0)
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
              ? data.lineas.map((l) => ({
                  ItemDescription: l.descripcion,
                  Quantity: l.cantidad,
                  UnitPriceWithoutTax: l.precioUnitario,
                  TotalCost: l.precioUnitario * l.cantidad,
                }))
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
