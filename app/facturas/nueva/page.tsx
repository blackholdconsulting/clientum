'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * ============================
 *   CONFIG – AJUSTA SI HACE FALTA
 * ============================
 */

// Ruta del PDF de tu app "como antes". Si tu endpoint era otro, cámbialo aquí:
const PDF_ENDPOINT = '/api/facturas/pdf';

// Nombre del fichero para descargas
const pdfFileName = (serie: string, numero: string) =>
  `factura-${(serie || '').trim()}${(numero || '').trim() || '0001'}.pdf`;
const xmlFileName = (serie: string, numero: string, signed?: boolean) =>
  `facturae-${(serie || '').trim()}${(numero || '').trim() || '0001'}${signed ? '-signed' : ''}.xml`;

/**
 * ============================
 *   TIPOS
 * ============================
 */
type Emisor = {
  nombre: string;
  nif: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
};

type Totales = {
  baseImponible: string; // "100.00"
  tipoIva: string;       // "21.00"
  cuotaIva: string;      // "21.00" (importe de IVA) – si no lo controlas, lo calculamos
  importeTotal: string;  // "121.00"
};

type FacturaMin = {
  serie: string;
  numero: string;
  fecha: string; // YYYY-MM-DD
  emisor: Emisor;
  totales: Totales;
};

/**
 * ============================
 *   HELPERS
 * ============================
 */
const esc = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Calcula IVA si hace falta
function normalizeTotals(t: Totales): Totales {
  const base = Number(t.baseImponible || 0);
  const tipo = Number(t.tipoIva || 0); // 21
  let cuota = Number(t.cuotaIva || 0);
  let total = Number(t.importeTotal || 0);

  if (!cuota && base && tipo) {
    cuota = +(base * (tipo / 100)).toFixed(2);
  }
  if (!total && (base || cuota)) {
    total = +(base + cuota).toFixed(2);
  }

  return {
    baseImponible: base.toFixed(2),
    tipoIva: tipo.toFixed(2),
    cuotaIva: cuota.toFixed(2),
    importeTotal: total.toFixed(2),
  };
}

function buildFacturaeXML(data: FacturaMin) {
  const d = { ...data, totales: normalizeTotals(data.totales) };
  const ivaImporte = (Number(d.totales.importeTotal) - Number(d.totales.baseImponible)).toFixed(2);

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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function signFacturaeXML(xml: string): Promise<Blob> {
  const resp = await fetch('/api/sign/xml', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    body: xml,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Error firmando XML (${resp.status}): ${text || resp.statusText}`);
  }
  return await resp.blob();
}

/**
 * ============================
 *   PÁGINA
 * ============================
 */
export default function NuevaFacturaPage() {
  // --- Estado del formulario ---
  const [serie, setSerie] = useState('A');
  const [numero, setNumero] = useState('0001');
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));

  const [emisor, setEmisor] = useState<Emisor>({
    nombre: '',
    nif: '',
    direccion: '',
    localidad: '',
    provincia: '',
  });

  const [totales, setTotales] = useState<Totales>({
    baseImponible: '100.00',
    tipoIva: '21.00',
    cuotaIva: '',
    importeTotal: '',
  });

  // --- Carga perfil de Supabase y vuelca al emisor si está vacío ---
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClientComponentClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Ajusta a tus campos reales de /profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select(
            'company_name, company_vat, company_address, company_city, company_province'
          )
          .eq('id', user.id)
          .single();

        if (!profile) return;

        setEmisor((prev) => ({
          nombre: prev.nombre || profile.company_name || '',
          nif: prev.nif || profile.company_vat || '',
          direccion: prev.direccion || profile.company_address || '',
          localidad: prev.localidad || profile.company_city || '',
          provincia: prev.provincia || profile.company_province || '',
        }));
      } catch {
        // ignoramos silenciosamente para no molestar al usuario
      }
    })();
  }, []);

  const facturaMin: FacturaMin = useMemo(
    () => ({
      serie,
      numero,
      fecha,
      emisor,
      totales,
    }),
    [serie, numero, fecha, emisor, totales]
  );

  // --- Acciones ---
  const [busy, setBusy] = useState<null | 'pdf' | 'xml' | 'sign'>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handlePdf() {
    try {
      setWarning(null);
      setBusy('pdf');

      // Enviamos la factura a tu endpoint de PDF "como antes".
      // Si tu endpoint espera otros campos, ajusta el body:
      const resp = await fetch(PDF_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facturaMin),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Error generado PDF: ${resp.status} ${text || ''}`.trim());
      }

      const blob = await resp.blob();
      downloadBlob(blob, pdfFileName(serie, numero));
    } catch (e: any) {
      setWarning(e?.message || 'Error generando PDF');
    } finally {
      setBusy(null);
    }
  }

  async function handleXML() {
    try {
      setWarning(null);
      setBusy('xml');
      const xml = buildFacturaeXML(facturaMin);
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      downloadBlob(blob, xmlFileName(serie, numero, false));
    } catch (e: any) {
      setWarning(e?.message || 'Error generando XML');
    } finally {
      setBusy(null);
    }
  }

  async function handleSign() {
    try {
      setWarning(null);
      setBusy('sign');
      const xml = buildFacturaeXML(facturaMin);
      const signed = await signFacturaeXML(xml); // 401 FIX → pasa por /api/sign/xml
      downloadBlob(signed, xmlFileName(serie, numero, true));
    } catch (e: any) {
      setWarning(e?.message || 'Error firmando XML');
    } finally {
      setBusy(null);
    }
  }

  /**
   * ============================
   *   UI – no tocamos tu formato (cabecera con 3 botones y secciones)
   * ============================
   */
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nueva factura</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePdf}
            className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-60"
            disabled={!!busy}
          >
            {busy === 'pdf' ? 'Generando PDF…' : 'Descargar PDF'}
          </button>

          <button
            type="button"
            onClick={handleXML}
            className="rounded-md bg-emerald-700 text-white px-3 py-2 text-sm hover:bg-emerald-600 disabled:opacity-60"
            disabled={!!busy}
          >
            {busy === 'xml' ? 'Generando XML…' : 'Descargar Facturae'}
          </button>

          <button
            type="button"
            onClick={handleSign}
            className="rounded-md bg-indigo-700 text-white px-3 py-2 text-sm hover:bg-indigo-600 disabled:opacity-60"
            disabled={!!busy}
          >
            {busy === 'sign'
              ? 'Firmando…'
              : 'Firmar y descargar Facturae (XAdES)'}
          </button>
        </div>
      </div>

      {/* Aviso/errores (igual que tu banda amarilla) */}
      {warning && (
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
          {warning}
        </div>
      )}

      {/* ====== EMISOR ====== */}
      <section className="rounded-md border bg-white p-4">
        <h2 className="text-sm font-semibold tracking-wide text-gray-600 mb-4">
          EMISOR
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-gray-600">Nombre / Razón social</label>
            <input
              id="emisor_nombre"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={emisor.nombre}
              onChange={(e) => setEmisor((p) => ({ ...p, nombre: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">NIF</label>
            <input
              id="emisor_nif"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={emisor.nif}
              onChange={(e) => setEmisor((p) => ({ ...p, nif: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600">Dirección</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={emisor.direccion || ''}
              onChange={(e) => setEmisor((p) => ({ ...p, direccion: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Localidad</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={emisor.localidad || ''}
              onChange={(e) => setEmisor((p) => ({ ...p, localidad: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Provincia</label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={emisor.provincia || ''}
              onChange={(e) => setEmisor((p) => ({ ...p, provincia: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* ====== DATOS FACTURA ====== */}
      <section className="rounded-md border bg-white p-4">
        <h2 className="text-sm font-semibold tracking-wide text-gray-600 mb-4">
          DATOS FACTURA
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs text-gray-600">Serie</label>
            <input
              id="factura_serie"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={serie}
              onChange={(e) => setSerie(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Número</label>
            <input
              id="factura_numero"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Fecha</label>
            <input
              id="factura_fecha"
              type="date"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ====== TOTALES ====== */}
      <section className="rounded-md border bg-white p-4">
        <h2 className="text-sm font-semibold tracking-wide text-gray-600 mb-4">
          TOTALES
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="block text-xs text-gray-600">Base imponible</label>
            <input
              id="base_imponible"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={totales.baseImponible}
              onChange={(e) =>
                setTotales((p) => ({ ...p, baseImponible: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Tipo IVA (%)</label>
            <input
              id="tipo_iva"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={totales.tipoIva}
              onChange={(e) => setTotales((p) => ({ ...p, tipoIva: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Cuota IVA</label>
            <input
              id="cuota_iva"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={totales.cuotaIva}
              onChange={(e) =>
                setTotales((p) => ({ ...p, cuotaIva: e.target.value }))
              }
              placeholder="Se calculará si lo dejas vacío"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600">Importe total</label>
            <input
              id="importe_total"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={totales.importeTotal}
              onChange={(e) =>
                setTotales((p) => ({ ...p, importeTotal: e.target.value }))
              }
              placeholder="Se calculará si lo dejas vacío"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
