// lib/facturae.ts
import { create } from "xmlbuilder2";

// Monta un objeto JS según el XSD de Facturae
export function buildFacturaeXML(data: {
  serie: string;
  numero: string;
  fecha: string;
  vencimiento: string;
  emisor: { nombre: string; nif: string; direccion: string; cp: string; ciudad: string };
  receptor: { nombre: string; cif: string; direccion: string; cp: string; ciudad: string };
  lineas: { descripcion: string; unidades: number; precioUnitario: number }[];
  iva: number;
  irpf: number;
}) {
  const { serie, numero, fecha, vencimiento, emisor, receptor, lineas, iva, irpf } = data;
  const factura = {
    Facturae: {
      "@xmlns": "http://www.facturae.es/Facturae/2009/v3.2/Facturaev3_2.xsd",
      FileHeader: {
        SchemaVersion: "3.2.1",
        Modality: "I",
        InvoiceIssuerType: "EM",
      },
      Parties: {
        SellerParty: {
          PartyIdentification: { VATIdentification: { TaxIdentificationNumber: emisor.nif } },
          PartyName: { Name: emisor.nombre },
          PostalAddress: {
            Address: emisor.direccion,
            PostCode: emisor.cp,
            City: emisor.ciudad,
            CountryCode: "ES",
          },
        },
        BuyerParty: {
          PartyIdentification: { VATIdentification: { TaxIdentificationNumber: receptor.cif } },
          PartyName: { Name: receptor.nombre },
          PostalAddress: {
            Address: receptor.direccion,
            PostCode: receptor.cp,
            City: receptor.ciudad,
            CountryCode: "ES",
          },
        },
      },
      Invoices: {
        Invoice: {
          InvoiceHeader: {
            InvoiceNumber: `${serie}-${numero}`,
            InvoiceSeriesCode: serie,
            InvoiceDate: fecha,
            PurchaseOrderReference: "",
            InvoiceDocumentType: "FC", // Factura
          },
          InvoiceItems: {
            InvoiceItem: lineas.map((l, idx) => ({
              InvoiceItemIdentification: { Number: idx + 1 },
              ItemDescription: l.descripcion,
              Quantity: l.unidades,
              UnitPriceWithoutTax: l.precioUnitario.toFixed(2),
              TotalCost: (l.unidades * l.precioUnitario).toFixed(2),
            })),
          },
          TaxesOutputs: {
            Tax: [
              {
                TaxTypeCode: "01",          // IVA
                TaxRate: iva.toFixed(2),
                TaxableBase: lineas
                  .reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0)
                  .toFixed(2),
                TaxAmount: (
                  (lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0) *
                    iva) /
                  100
                ).toFixed(2),
              },
            ],
          },
          LegalLiterals: {
            LegalLiteral: `Retención IRPF ${irpf}%: -${(
              (lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0) *
                irpf) /
              100
            ).toFixed(2)} €`,
          },
        },
      },
    },
  };

  // Creamos el XML
  const doc = create(factura as any, { encoding: "UTF-8" });
  return doc.end({ prettyPrint: true });
}
