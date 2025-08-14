// app/(lib)/invoice-signer.ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type FacturaMin = {
  emisorNombre: string;
  emisorNif: string;
  serie: string;
  numero: string;
  fecha: string;          // YYYY-MM-DD
  baseImponible: string;  // "100.00"
  cuotaIva: string;       // "21.00"
  importeTotal: string;   // "121.00"
};

// ⬇️ Mapea aquí tus IDs reales de los inputs ya existentes
const FIELDS = {
  emisorNombre: "emisor_nombre",
  emisorNif: "emisor_nif",
  serie: "factura_serie",
  numero: "factura_numero",
  fecha: "factura_fecha",
  baseImponible: "base_imponible",
  cuotaIva: "cuota_iva",
  importeTotal: "importe_total",
} as const;

function q<T extends keyof typeof FIELDS>(key: T): HTMLInputElement | null {
  return document.getElementById(FIELDS[key]) as HTMLInputElement | null;
}

// Rellena emisor con datos del perfil si están vacíos
export async function prefillEmitterFromProfile() {
  try {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_vat")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const nombre = q("emisorNombre");
    const nif = q("emisorNif");

    if (nombre && !nombre.value) nombre.value = profile.company_name || "";
    if (nif && !nif.value) nif.value = profile.company_vat || "";
  } catch {}
}

export function collectInvoice(): FacturaMin {
  const get = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value?.trim() || "";
  return {
    emisorNombre: get(FIELDS.emisorNombre),
    emisorNif: get(FIELDS.emisorNif),
    serie: get(FIELDS.serie),
    numero: get(FIELDS.numero),
    fecha: get(FIELDS.fecha),
    baseImponible: get(FIELDS.baseImponible),
    cuotaIva: get(FIELDS.cuotaIva),
    importeTotal: get(FIELDS.importeTotal),
  };
}

// XML Facturae mínimo (para homologación) – ajusta si lo necesitas
export function buildFacturaeXML(d: FacturaMin) {
  const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
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
        <TaxIdentificationNumber>${esc(d.emisorNif)}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${esc(d.emisorNombre)}</CorporateName>
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
          <TaxRate>${esc(d.cuotaIva)}</TaxRate>
          <TaxableBase><TotalAmount>${esc(d.baseImponible)}</TotalAmount></TaxableBase>
          <TaxAmount><TotalAmount>${esc((Number(d.importeTotal)-Number(d.baseImponible)).toFixed(2))}</TotalAmount></TaxAmount>
        </Tax>
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGrossAmount>${esc(d.baseImponible)}</TotalGrossAmount>
        <TotalTaxOutputs>${esc((Number(d.importeTotal)-Number(d.baseImponible)).toFixed(2))}</TotalTaxOutputs>
        <TotalGeneralTaxes>${esc((Number(d.importeTotal)-Number(d.baseImponible)).toFixed(2))}</TotalGeneralTaxes>
        <TotalInvoiceAmount>${esc(d.importeTotal)}</TotalInvoiceAmount>
      </InvoiceTotals>
    </Invoice>
  </Invoices>
</Facturae>`;
}

// Descarga helper (blob → file)
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

// Firma vía proxy
export async function signFacturaeXML(xml: string): Promise<Blob> {
  const resp = await fetch("/api/sign/xml", {
    method: "POST",
    headers: { "Content-Type": "application/xml; charset=utf-8" },
    body: xml,
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Error firmando: ${resp.status} ${txt || resp.statusText}`);
  }
  return await resp.blob();
}
