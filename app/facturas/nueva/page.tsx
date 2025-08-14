"use client";

import { useEffect, useMemo, useState } from "react";

/** ---------------------
 *  Tipos simples
 * --------------------- */
type Emisor = {
  nombre?: string;
  nif?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  cp?: string;
  email?: string;
  telefono?: string;
};

type FacturaForm = {
  emisor: Emisor;
  serie: string;
  numero: string;
  fecha: string;
  baseImponible: string; // guardamos como string en inputs, convertimos al calcular
  tipoIVA: string;
  cuotaIVA: string;
  importeTotal: string;
};

/** ---------------------
 *  Utils mínimos
 * --------------------- */
function toNum(n?: string) {
  const x = Number((n ?? "").toString().replace(",", "."));
  return isFinite(x) ? x : 0;
}

function format2(n: number) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

/** ---------------------
 *  API helpers
 * --------------------- */

// 1) Carga emisor desde tu perfil (ajusta el endpoint si usas otro)
async function fetchEmisorFromProfile(): Promise<Emisor | null> {
  try {
    const resp = await fetch("/api/profile/emisor", { cache: "no-store" });
    if (!resp.ok) return null;
    return (await resp.json()) as Emisor;
  } catch {
    return null;
  }
}

// 2) Construye un Facturae mínimo para exportar
function buildFacturaeXML(d: FacturaForm): string {
  const base = toNum(d.baseImponible);
  const tipo = toNum(d.tipoIVA);
  const cuota = d.cuotaIVA ? toNum(d.cuotaIVA) : (base * tipo) / 100;
  const total = d.importeTotal ? toNum(d.importeTotal) : base + cuota;

  const esc = (s?: string) =>
    (s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Facturae>
  <FileHeader>
    <SchemaVersion>3.2.1</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <TaxIdentificationNumber>${esc(d.emisor.nif)}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${esc(d.emisor.nombre)}</CorporateName>
        <AddressInSpain>
          <Address>${esc(d.emisor.direccion)}</Address>
          <PostCode>${esc(d.emisor.cp)}</PostCode>
          <Town>${esc(d.emisor.localidad)}</Town>
          <Province>${esc(d.emisor.provincia)}</Province>
          <CountryCode>ESP</CountryCode>
        </AddressInSpain>
      </LegalEntity>
    </SellerParty>
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
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
      </InvoiceIssueData>
      <TaxesOutputs>
        <Tax>
          <TaxTypeCode>01</TaxTypeCode>
          <TaxRate>${format2(tipo)}</TaxRate>
          <TaxableBase>
            <TotalAmount>${format2(base)}</TotalAmount>
          </TaxableBase>
          <TaxAmount>
            <TotalAmount>${format2(cuota)}</TotalAmount>
          </TaxAmount>
        </Tax>
      </TaxesOutputs>
      <InvoiceTotals>
        <TotalGeneralTaxes>${format2(cuota)}</TotalGeneralTaxes>
        <TotalInvoiceAmount>${format2(total)}</TotalInvoiceAmount>
      </InvoiceTotals>
    </Invoice>
  </Invoices>
</Facturae>`;
}

// 3) Firma el XML contra tu microservicio (proxy Next)
async function signFacturaeXML(xml: string): Promise<Blob> {
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

// 4) Descarga Blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// 5) Nombres de archivo
function pdfFileName(d: FacturaForm) {
  return `factura-${(d.serie || "").trim()}${(d.numero || "").trim() || "0001"}.pdf`;
}
function xmlFileName(d: FacturaForm, signed = false) {
  return `factura-${(d.serie || "").trim()}${(d.numero || "").trim() || "0001"}${signed ? "-signed" : ""}.xml`;
}

/** ---------------------
 *  Página
 * --------------------- */
export default function NuevaFacturaPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "pdf" | "xml" | "sign">(null);

  const [form, setForm] = useState<FacturaForm>(() => ({
    emisor: {},
    serie: "A",
    numero: "0001",
    // YYYY-MM-DD (como en el screenshot)
    fecha: new Date().toISOString().slice(0, 10),
    baseImponible: "100.00",
    tipoIVA: "21.00",
    cuotaIVA: "", // si va vacío se calcula
    importeTotal: "", // si va vacío se calcula
  }));

  // Recalcular totales cuando cambian base/tipo/cuota/importe
  const calculos = useMemo(() => {
    const base = toNum(form.baseImponible);
    const tipo = toNum(form.tipoIVA);
    const cuota = form.cuotaIVA ? toNum(form.cuotaIVA) : (base * tipo) / 100;
    const total = form.importeTotal ? toNum(form.importeTotal) : base + cuota;
    return {
      baseFmt: format2(base),
      tipoFmt: format2(tipo),
      cuotaFmt: format2(cuota),
      totalFmt: format2(total),
    };
  }, [form.baseImponible, form.tipoIVA, form.cuotaIVA, form.importeTotal]);

  // Prefill emisor automáticamente
  useEffect(() => {
    (async () => {
      const emisor = await fetchEmisorFromProfile();
      if (emisor) {
        setForm((f) => ({ ...f, emisor: { ...f.emisor, ...emisor } }));
      }
    })().catch(() => {});
  }, []);

  /** Handlers de cambio */
  const setEmisor = (patch: Partial<Emisor>) =>
    setForm((f) => ({ ...f, emisor: { ...f.emisor, ...patch } }));
  const setField = <K extends keyof FacturaForm>(key: K, val: FacturaForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  /** Botones superiores */
  async function onDescargarPDF() {
    try {
      setMsg(null);
      setBusy("pdf");
      // POST JSON (tu API de PDF exige POST, el 405 viene por GET)
      const resp = await fetch("/api/facturas/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error(`Error PDF: ${resp.status}`);
      const blob = await resp.blob();
      downloadBlob(blob, pdfFileName(form));
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Error generando PDF");
    } finally {
      setBusy(null);
    }
  }

  async function onDescargarFacturae() {
    try {
      setMsg(null);
      setBusy("xml");
      const xml = buildFacturaeXML(form);
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      downloadBlob(blob, xmlFileName(form, false));
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Error generando XML");
    } finally {
      setBusy(null);
    }
  }

  async function onFirmarFacturae() {
    try {
      setMsg(null);
      setBusy("sign");
      const xml = buildFacturaeXML(form);
      const blob = await signFacturaeXML(xml); // via /api/sign/xml -> microservicio
      downloadBlob(blob, xmlFileName(form, true));
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Error firmando XML");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Nueva factura</h1>

      {/* Botonera superior */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={onDescargarPDF}
          disabled={busy === "pdf"}
          className="px-4 py-2 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {busy === "pdf" ? "Generando PDF..." : "Descargar PDF"}
        </button>
        <button
          onClick={onDescargarFacturae}
          disabled={busy === "xml"}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {busy === "xml" ? "Generando XML..." : "Descargar Facturae"}
        </button>
        <button
          onClick={onFirmarFacturae}
          disabled={busy === "sign"}
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy === "sign" ? "Firmando..." : "Firmar y descargar Facturae (XAdES)"}
        </button>
      </div>

      {/* Aviso */}
      {msg && (
        <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3">
          {msg}
        </div>
      )}

      {/* EMISOR */}
      <section className="mb-6 rounded border bg-white">
        <div className="px-4 py-3 font-medium border-b">EMISOR</div>
        <div className="p-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600">Nombre / Razón social</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.emisor.nombre ?? ""}
              onChange={(e) => setEmisor({ nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">NIF</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.emisor.nif ?? ""}
              onChange={(e) => setEmisor({ nif: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-600">Dirección</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.emisor.direccion ?? ""}
              onChange={(e) => setEmisor({ direccion: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Localidad</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.emisor.localidad ?? ""}
              onChange={(e) => setEmisor({ localidad: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Provincia</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.emisor.provincia ?? ""}
              onChange={(e) => setEmisor({ provincia: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* DATOS FACTURA */}
      <section className="mb-6 rounded border bg-white">
        <div className="px-4 py-3 font-medium border-b">DATOS FACTURA</div>
        <div className="p-4 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-600">Serie</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.serie}
              onChange={(e) => setField("serie", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Número</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.numero}
              onChange={(e) => setField("numero", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Fecha</label>
            <input
              type="date"
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.fecha}
              onChange={(e) => setField("fecha", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* TOTALES */}
      <section className="mb-10 rounded border bg-white">
        <div className="px-4 py-3 font-medium border-b">TOTALES</div>
        <div className="p-4 grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-600">Base imponible</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.baseImponible}
              onChange={(e) => setField("baseImponible", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Tipo IVA (%)</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.tipoIVA}
              onChange={(e) => setField("tipoIVA", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Cuota IVA</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Se calculará si lo dejas vacío"
              value={form.cuotaIVA}
              onChange={(e) => setField("cuotaIVA", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Importe total</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Se calculará si lo dejas vacío"
              value={form.importeTotal}
              onChange={(e) => setField("importeTotal", e.target.value)}
            />
          </div>
        </div>

        {/* Vista rápida de cálculo */}
        <div className="px-4 pb-4 text-sm text-slate-600">
          <div>Base: <b>{calculos.baseFmt}</b> — Tipo: <b>{calculos.tipoFmt}%</b> — Cuota: <b>{calculos.cuotaFmt}</b> — Total: <b>{calculos.totalFmt}</b></div>
        </div>
      </section>
    </div>
  );
}
