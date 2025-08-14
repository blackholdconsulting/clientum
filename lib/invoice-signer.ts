// lib/invoice-signer.ts

// ---- Tipos mínimos para construir el XML ----
export type Party = {
  nif: string;
  nombre: string;
};

export type Totales = {
  baseImponible: number; // taxable base
  tipoIVA: number;       // % IVA (p.ej. 21)
  cuotaIVA: number;      // importe IVA
  importeTotal: number;  // total factura
};

export type FacturaMin = {
  emisor: Party;
  receptor: Party;
  serie?: string;
  numero?: string;
  fechaExpedicion: string; // YYYY-MM-DD
  totales: Totales;
};

// ---- Utilidades ----
function esc(v: string | number): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function money(n: number): string {
  // Facturae usa punto decimal y 2 decimales
  return (Number.isFinite(n) ? n : 0).toFixed(2);
}

function normalizaFecha(d: string): string {
  // acepta YYYY-MM-DD o Date.toISOString() y devuelve YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try {
    const dt = new Date(d);
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${dt.getFullYear()}-${m}-${day}`;
  } catch {
    return d;
  }
}

// ---- 1) Construcción de XML Facturae (mínimo) ----
// Nota: Estructura compatible con Facturae 3.2.2; suficiente para firmar XAdES.
// Si necesitas rellenar más campos para validaciones estrictas, amplíalo aquí.
export function buildFacturaeXML(d: FacturaMin): string {
  const serie = (d.serie || "").trim();
  const numero = (d.numero || "0001").trim();
  const fecha = normalizaFecha(d.fechaExpedicion);

  const base = money(d.totales.baseImponible);
  const tipo = money(d.totales.tipoIVA);
  const ivaImporte = money(d.totales.cuotaIVA);
  const total = money(d.totales.importeTotal);

  // Un concepto “genérico” con la base e IVA
  // (Facturae permite múltiples líneas; aquí usamos una para el mínimo)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Facturae xmlns="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2/Facturae"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2/Facturae http://www.facturae.gob.es/formato/Versiones/Facturaev3_2/Facturae/FacturaeV3_2_2.xsd"
          Version="3.2.2">
  <FileHeader>
    <SchemaVersion>3.2.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
    <Batch>
      <BatchIdentifier>${esc(serie ? `${serie}-${numero}` : numero)}</BatchIdentifier>
      <InvoicesCount>1</InvoicesCount>
      <TotalInvoicesAmount>
        <TotalAmount>${esc(total)}</TotalAmount>
      </TotalInvoicesAmount>
      <TotalOutstandingAmount>
        <TotalAmount>${esc(total)}</TotalAmount>
      </TotalOutstandingAmount>
      <TotalExecutableAmount>
        <TotalAmount>${esc(total)}</TotalAmount>
      </TotalExecutableAmount>
      <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
    </Batch>
  </FileHeader>

  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${esc(d.emisor.nif)}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${esc(d.emisor.nombre)}</CorporateName>
      </LegalEntity>
    </SellerParty>

    <BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${esc(d.receptor.nif)}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${esc(d.receptor.nombre)}</CorporateName>
      </LegalEntity>
    </BuyerParty>
  </Parties>

  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${esc(numero)}</InvoiceNumber>
        <InvoiceSeriesCode>${esc(serie)}</InvoiceSeriesCode>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>S</InvoiceClass>
      </InvoiceHeader>

      <InvoiceIssueData>
        <IssueDate>${esc(fecha)}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>

      <TaxesOutputs>
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>${esc(tipo)}</TaxRate>
          <TaxableBase>
            <TotalAmount>${esc(base)}</TotalAmount>
          </TaxableBase>
          <TaxAmount>
            <TotalAmount>${esc(ivaImporte)}</TotalAmount>
          </TaxAmount>
        </Tax>
      </TaxesOutputs>

      <InvoiceTotals>
        <TotalGeneralTaxes>${esc(ivaImporte)}</TotalGeneralTaxes>
        <TotalGrossAmount>${esc(base)}</TotalGrossAmount>
        <TotalGrossAmountBeforeTaxes>${esc(base)}</TotalGrossAmountBeforeTaxes>
        <TotalTaxOutputs>${esc(ivaImporte)}</TotalTaxOutputs>
        <TotalTaxesWithheld>0.00</TotalTaxesWithheld>
        <InvoiceTotal>${esc(total)}</InvoiceTotal>
        <TotalOutstandingAmount>${esc(total)}</TotalOutstandingAmount>
        <TotalExecutableAmount>${esc(total)}</TotalExecutableAmount>
      </InvoiceTotals>

      <Items>
        <InvoiceLine>
          <IssuerContractReference>1</IssuerContractReference>
          <ItemDescription>Servicios / Bienes</ItemDescription>
          <Quantity>1.00</Quantity>
          <UnitOfMeasure>01</UnitOfMeasure>
          <UnitPriceWithoutTax>${esc(base)}</UnitPriceWithoutTax>
          <TotalCost>${esc(base)}</TotalCost>
          <GrossAmount>${esc(base)}</GrossAmount>
          <TaxesOutputs>
            <Tax>
              <TaxTypeCode>01</TaxTypeCode>
              <TaxRate>${esc(tipo)}</TaxRate>
              <TaxAmount>
                <TotalAmount>${esc(ivaImporte)}</TotalAmount>
              </TaxAmount>
            </Tax>
          </TaxesOutputs>
        </InvoiceLine>
      </Items>
    </Invoice>
  </Invoices>
</Facturae>`;

  return xml;
}

// ---- 2) Firma via proxy seguro de Next (/api/sign) ----
export async function signFacturaeXML(xml: string): Promise<Blob> {
  const resp = await fetch("/api/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      Accept: "application/xml",
    },
    body: xml,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Error firmando XML (${resp.status}): ${text || resp.statusText}`);
  }
  return await resp.blob();
}

// ---- 3) Descarga de blobs ----
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- 4) Nombres de archivo ----
export const pdfFileName = (serie: string, numero: string) =>
  `factura-${(serie || "").trim()}${(numero || "").trim() || "0001"}.pdf`;

export const xmlFileName = (serie: string, numero: string, signed?: boolean) =>
  `factura-${(serie || "").trim()}${(numero || "").trim() || "0001"}${signed ? "-signed" : ""}.xml`;
