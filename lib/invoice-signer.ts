// lib/invoice-signer.ts
// Helpers de firma + compatibilidad con páginas existentes.
// Evita dependencias nuevas e intenta ser isomórfico (cliente/servidor).
// Solo 'downloadBlob' exige navegador.

export type CollectedInvoice = {
  issueDate?: string;
  type?: string;
  totals?: { base: number; tax: number; total: number };
  // claves usadas en distintos sitios
  serie?: string;      // ES
  numero?: number;     // ES
  series?: string;     // EN
  number?: number;     // EN
};

// =================== Firma XAdES vía proxy /api/sign/xml ===================

export async function signFacturaeXml(xml: string): Promise<Uint8Array> {
  const apiKey = process.env.SIGNER_API_KEY!;
  if (!apiKey) throw new Error('Falta SIGNER_API_KEY en variables de entorno.');

  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const res = await fetch(new URL('/api/sign/xml', base), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'X-API-Key': apiKey,
    },
    body: xml,
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('Autenticación inválida con el servicio de firma (401/403).');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error del servicio de firma (${res.status}): ${text || 'sin cuerpo'}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Builder de Facturae.
 * - Si ya tienes el real, exporta ese en lugar de este placeholder.
 * - Mantenemos la firma para no romper importadores.
 */
export async function buildFacturaeXml(payload: any): Promise<string> {
  if ((globalThis as any).__existing_buildFacturaeXml) {
    return (globalThis as any).__existing_buildFacturaeXml(payload);
  }
  return `<?xml version="1.0" encoding="UTF-8"?><Facturae><PlaceHolder/></Facturae>`;
}

// ============================== SHIMS/ALIASES ==============================

/**
 * Alias para compatibilidad con páginas que importan este nombre.
 * Acepta:
 *  - string (XML) -> firma directa
 *  - object (payload) -> construye XML y luego firma
 */
export async function signFacturaeXML(input: string | Record<string, any>) {
  const xml = typeof input === 'string' ? input : await buildFacturaeXml(input);
  return await signFacturaeXml(xml);
}

/** Descargar blob (solo cliente). Para SSR lanza excepción controlada. */
export function downloadBlob(
  data: Uint8Array | string | Blob,
  filename: string,
  mime: string = 'application/octet-stream'
) {
  if (typeof window === 'undefined') {
    throw new Error('downloadBlob solo puede usarse en el cliente (navegador).');
  }
  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else {
    const bytes =
      typeof data === 'string' ? Uint8Array.from(atob(data), (c) => c.charCodeAt(0)) : data;
    blob = new Blob([bytes], { type: mime });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Nombre de archivo XML; tercer parámetro puede ser ext string o boolean "signed" */
export function xmlFileName(series: string, number: number, extOrSigned: string | boolean = 'xml') {
  const n = String(number ?? 0).padStart(6, '0');
  const isSigned = typeof extOrSigned === 'boolean' ? extOrSigned : false;
  const ext = typeof extOrSigned === 'string' ? extOrSigned.replace(/^\./, '') : 'xml';
  const suffix = isSigned ? '-signed' : '';
  return `FACT_${series}-${n}${suffix}.${ext}`;
}

/** Nombre de archivo PDF; tercer parámetro puede ser ext string o boolean "signed" */
export function pdfFileName(series: string, number: number, extOrSigned: string | boolean = 'pdf') {
  const n = String(number ?? 0).padStart(6, '0');
  const isSigned = typeof extOrSigned === 'boolean' ? extOrSigned : false;
  const ext = typeof extOrSigned === 'string' ? extOrSigned.replace(/^\./, '') : 'pdf';
  const suffix = isSigned ? '-signed' : '';
  return `FACT_${series}-${n}${suffix}.${ext}`;
}

/**
 * Recoger datos desde un <form>.
 * Compatibilidad: puede llamarse SIN argumentos (detecta automáticamente el form).
 * Garante: devuelve SIEMPRE { serie, numero } y lanza error si no puede resolverlos.
 */
export function collectInvoiceFromForm(
  form?: HTMLFormElement | null
): CollectedInvoice & { serie: string; numero: number } {
  if (typeof window === 'undefined') {
    throw new Error('collectInvoiceFromForm requiere entorno de navegador.');
  }

  // Autodetección si no se pasa form:
  let target: HTMLFormElement | null = form ?? null;
  if (!target) {
    target = document.querySelector('form[data-invoice-form]') as HTMLFormElement | null;
  }
  if (!target) {
    target = document.getElementById('invoice-form') as HTMLFormElement | null;
  }
  if (!target) {
    target = document.querySelector('form') as HTMLFormElement | null;
  }
  if (!target) {
    throw new Error('No se encontró el formulario de factura en la página.');
  }

  const fd = new FormData(target);

  const pick = (names: string[]): string | undefined => {
    for (const n of names) {
      const v = fd.get(n);
      if (v != null && String(v).trim() !== '') return String(v);
    }
    return undefined;
  };

  const issueDate = pick(['issueDate', 'fecha', 'fecha_emision', 'issue_date']);
  const type = pick(['type', 'tipo', 'invoice_type']);

  const base = Number(pick(['totalBase', 'base', 'subtotal']) ?? 0);
  const tax = Number(pick(['totalTax', 'iva', 'tax']) ?? 0);
  const total = Number(pick(['total', 'total_amount', 'importe_total']) ?? 0);

  // SERIE y NÚMERO desde varios nombres posibles o data-attrs
  const serieStr =
    pick(['serie', 'series', 'invoice_series', 'invoiceSeries']) ??
    (target.dataset ? target.dataset.series : undefined);
  const numeroStr =
    pick(['numero', 'number', 'invoice_number', 'invoiceNumber']) ??
    (target.dataset ? target.dataset.number : undefined);

  const serie = serieStr ? String(serieStr).trim() : undefined;
  const numeroParsed = numeroStr ? Number(numeroStr) : NaN;
  const numero = Number.isFinite(numeroParsed) ? numeroParsed : undefined;

  if (!serie || typeof numero !== 'number') {
    throw new Error(
      'No se pudieron determinar "serie" y "numero" de la factura. Asegúrate de que existan inputs ' +
        '(serie/numero o invoice_series/invoice_number) o data-series/data-number en el <form>.'
    );
  }

  return {
    issueDate,
    type,
    totals: { base, tax, total },
    serie,
    numero,
    // duplicados habituales por compatibilidad
    series: serie,
    number: numero,
  };
}

// ============================ Veri*factu (RF/QR) ===========================

import type { VeriFactuPayload } from './verifactu';
import { buildRFString, qrDataUrlFromRF } from './verifactu';

/**
 * Alta Veri*factu "light": construye el RF y genera QR en cliente.
 * - Devuelve { rf, qr } para ser compatible con FacturaSignerBar.tsx
 * - Para compatibilidad hacia atrás, también incluye { qrDataUrl } a nivel raíz.
 */
export async function verifactuAlta(
  payload: VeriFactuPayload | Record<string, any>
): Promise<{ rf: string; qr: { dataUrl: string | null; pngDataUrl?: string | null }; qrDataUrl: string | null }> {
  // Permitir payloads "sueltos" (p. ej. salida de collectInvoiceFromForm)
  const mapped: VeriFactuPayload = {
    issuerTaxId:
      (payload as any).issuerTaxId ??
      (payload as any).emisor?.taxId ??
      (payload as any).issuer?.taxId ??
      'N/A',
    issueDate:
      (payload as any).issueDate ??
      (payload as any).fecha ??
      (payload as any).issue_date ??
      new Date().toISOString().slice(0, 10),
    invoiceType: ((): 'completa' | 'simplificada' | 'rectificativa' => {
      const t = String(
        (payload as any).invoiceType ?? (payload as any).type ?? 'completa'
      ).toLowerCase();
      if (t.startsWith('simp')) return 'simplificada';
      if (t.startsWith('rect')) return 'rectificativa';
      return 'completa';
    })(),
    total:
      Number(
        (payload as any).total ??
          (payload as any).totals?.total ??
          (payload as any).importe_total ??
          0
      ) || 0,
    software: 'Clientum Signer v0.0.1',
    series:
      (payload as any).series ??
      (payload as any).serie ??
      (payload as any).invoice_series ??
      'A',
    number:
      Number(
        (payload as any).number ??
          (payload as any).numero ??
          (payload as any).invoice_number ??
          0
      ) || 0,
  };

  const rf = buildRFString(mapped);

  // Intentar generar el QR solo en cliente
  let dataUrl: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      dataUrl = await qrDataUrlFromRF(rf);
    } catch {
      dataUrl = null;
    }
  }

  // Estructura compatible con FacturaSignerBar.tsx:
  const qr = {
    dataUrl,
    pngDataUrl: dataUrl, // alias
  };

  return { rf, qr, qrDataUrl: dataUrl };
}

