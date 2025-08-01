// utils/facturae.ts
import { format } from "date-fns";

interface Emisor {
  nombre: string;
  nif: string;
  direccion: string;
  ciudad: string;
  cp: string;
  provincia: string;
  pais: string;
}

interface Cliente {
  nombre: string;
  nif: string;
  direccion: string;
  ciudad: string;
  cp: string;
  provincia: string;
  pais: string;
}

interface LineaFactura {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  iva: number;
}

interface FacturaData {
  numeroFactura: string;
  fecha: Date;
  emisor: Emisor;
  cliente: Cliente;
  lineas: LineaFactura[];
}

export function generateFacturaeXML(data: FacturaData): string {
  const fechaEmision = format(data.fecha, "yyyy-MM-dd");

  const totalBase = data.lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);
  const totalIVA = data.lineas.reduce((acc, l) => acc + (l.cantidad * l.precioUnitario * l.iva) / 100, 0);
  const totalFactura = totalBase + totalIVA;

  const lineasXML = data.lineas.map((l, i) => `
    <InvoiceLine>
      <InvoiceLineNumber>${i + 1}</InvoiceLineNumber>
      <ItemDescription>${l.descripcion}</ItemDescription>
      <Quantity>${l.cantidad.toFixed(2)}</Quantity>
      <UnitPriceWithoutTax>${l.precioUnitario.toFixed(2)}</UnitPriceWithoutTax>
      <Tax>
        <TaxTypeCode>01</TaxTypeCode>
        <TaxRate>${l.iva}</TaxRate>
        <TaxAmount>${((l.cantidad * l.precioUnitario * l.iva) / 100).toFixed(2)}</TaxAmount>
      </Tax>
      <LineTotalAmount>${(l.cantidad * l.precioUnitario + (l.cantidad * l.precioUnitario * l.iva) / 100).toFixed(2)}</LineTotalAmount>
    </InvoiceLine>
  `).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Facturae xmlns="http://www.facturae.es/Facturae/2014/v3.2.2/Facturae"
          xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
          Version="3.2.2">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${data.numeroFactura}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount>
        <TotalAmount>${totalFactura.toFixed(2)}</TotalAmount>
      </TotalInvoicesAmount>
      <TotalOutstandingAmount>
        <TotalAmount>${totalFactura.toFixed(2)}</TotalAmount>
      </TotalOutstandingAmount>
      <TotalExecutableAmount>
        <TotalAmount>${totalFactura.toFixed(2)}</TotalAmount>
      </TotalExecutableAmount>
    </Batch>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${data.emisor.nif}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${data.emisor.nombre}</CorporateName>
        <AddressInSpain>
          <Address>${data.emisor.direccion}</Address>
          <PostCode>${data.emisor.cp}</PostCode>
          <Town>${data.emisor.ciudad}</Town>
          <Province>${data.emisor.provincia}</Province>
          <CountryCode>${data.emisor.pais}</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>F</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${data.cliente.nif}</TaxIdentificationNumber>
      </TaxIdentification>
      <Individual>
        <Name>${data.cliente.nombre}</Name>
        <AddressInSpain>
          <Address>${data.cliente.direccion}</Address>
          <PostCode>${data.cliente.cp}</PostCode>
          <Town>${data.cliente.ciudad}</Town>
          <Province>${data.cliente.provincia}</Province>
          <CountryCode>${data.cliente.pais}</CountryCode>
        </AddressInSpain>
      </Individual>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${data.numeroFactura}</InvoiceNumber>
        <InvoiceSeriesCode>FAC</InvoiceSeriesCode>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
      </InvoiceHeader>
      <InvoiceIssueData>
        <IssueDate>${fechaEmision}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
      <TaxesOutputs>
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>21.00</TaxRate>
          <TaxableBase>
            <TotalAmount>${totalBase.toFixed(2)}</TotalAmount>
          </TaxableBase>
          <TaxAmount>
            <TotalAmount>${totalIVA.toFixed(2)}</TotalAmount>
          </TaxAmount>
        </Tax>
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGrossAmount>${totalBase.toFixed(2)}</TotalGrossAmount>
        <TotalTaxOutputs>${totalIVA.toFixed(2)}</TotalTaxOutputs>
        <InvoiceTotal>${totalFactura.toFixed(2)}</InvoiceTotal>
      </InvoiceTotals>
      <Items>${lineasXML}</Items>
    </Invoice>
  </Invoices>
</Facturae>`;
}
