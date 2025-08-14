// lib/invoice-signer.ts
// Utilidades para generar y firmar Facturae + descargas

export type Emisor = {
  nombre: string;
  nif: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
};

export type Totales = {
  baseImponible: string; // "100.00"
  tipoIva: string;       // "21.00"
  cuotaIva?: string;     // si viene vacío lo calculamos
  importeTotal?: string; // si viene vacío lo calculamos
};

export type FacturaMin = {
  serie: string;
  numero: string;
  fecha: string; // YYYY-MM-DD
  emisor: Emisor;
  totales: Totales;
};

// ===== Helpers =====
const esc = (s: string) =>
  (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function normalizeTotals(t: Totales): Required<Totales> {
  const base = Number(t.baseImponible || 0);
  const tipo = Number(t.tipoIva || 0);
  let cuota = Number(t.cuotaIva || 0);
  let total = Number(t.importeTotal || 0);

  if (!cuota && base && tipo) cuota = +(base * (tipo / 100)).toFixed(2);
  if (!total && (base || cuota)) total = +(base + cuota).toFixed(2);

  return {
    baseImponible: base.toFixed(2),
    tipoIva: tipo.toFixed(2),
    cuotaIva: cuota.toFixed(2),
    importeTotal: total.toFixed(2),
  };
}

// ===== API =====

/** Genera un XML Facturae 3.2 mínimo para homologación. */
export function buildFacturaeXML(data: FacturaMin): string {
  const d = { ...data, totales: normalizeTotals(data.totales) };
  const ivaImporte = (
    Number(d.totales.importeTotal) - Number(d.totales.baseImponible)
  ).toFixed(2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Facturae xmlns="http://www.facturae.es/Facturae/2009/v3.2/Facturae">
  <FileHeader>
    <SchemaVersion>3.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
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
        <TaxIdentificationNumber>ES00000000T</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>ACME CLIENTE</CorporateName>
      </LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${esc(d.numero)}</InvoiceNumber>
        <InvoiceSeriesCode>${esc(d.serie)}</InvoiceSeriesCode>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <InvoiceClass>OO</InvoiceClass>
      </InvoiceHeader>
      <InvoiceIssueData>
        <IssueDate>${esc(d.fecha)}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
      <TaxesOutputs>
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>${esc(d.totales.tipoIva)}</TaxRate>
          <TaxableBase><TotalAmount>${esc(d.totales.baseImponible)}</TotalAmount></TaxableBase>
          <TaxAmount><TotalAmount>${esc(ivaImporte)}</TotalAmount></TaxAmount>
        </Tax>
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGrossAmount>${esc(d.totales.baseImponible)}</TotalGrossAmount>
        <TotalTaxOutputs>${esc(ivaImporte)}</TotalTaxOutputs>
        <TotalGeneralTaxes>${esc(ivaImporte)}</TotalGeneralTaxes>
        <TotalInvoiceAmount>${esc(d.totales.importeTotal)}</TotalInvoiceAmount>
      </InvoiceTotals>
    </Invoice>
  </Invoices>
</Facturae>`;
}

/** Firma el XML via tu proxy `/api/sign/xml`. */
export async function signFacturaeXML(xml: string): Promise<Blob> {
  const resp = await fetch("/api/sign/xml", {
    method: "POST",
    headers: { "Content-Type": "application/xml; charset=utf-8" },
    body: xml,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Error firmando XML (${resp.status}): ${text || resp.statusText}`);
  }
  return await resp.blob();
}

/** Descarga un Blob. */
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

export const pdfFileName = (serie: string, numero: string) =>
  `factura-${(serie || "").trim()}${(numero || "").trim() || "0001"}.pdf`;

export const xmlFileName = (serie: string, numero: string, signed?: boolean) =>
  `facturae-${(serie || "").trim()}${(numero || "").trim() || "0001"}${signed ? "-signed" : ""}.xml`;
