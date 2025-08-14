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

/** Alias para compatibilidad con páginas que importan este nombre concreto */
export async function signFacturaeXML(xml: string) {
  return await signFacturaeXml(xml);
}

/** Descargar blob (solo cliente). Para SSR lanza excepción controlada. */
export function downloadBlob(
  data: Uint8Array | string,
  filename: string,
  mime: string = 'application/xml'
) {
  if (typeof window === 'undefined') {
    throw new Error('downloadBlob solo puede usarse en el cliente (navegador).');
  }
  const bytes =
    typeof data === 'string' ? Uint8Array.from(atob(data), (c) => c.charCodeAt(0)) : data;
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Nombre de archivo XML a partir de serie y número */
export function xmlFileName(series: string, number: number, ext: string = 'xml') {
  const n = String(number ?? 0).padStart(6, '0');
  return `FACT_${series}-${n}.${ext}`;
}

/** Nombre de archivo PDF a partir de serie y número */
export function pdfFileName(series: string, number: number, ext: string = 'pdf') {
  const n = String(number ?? 0).padStart(6, '0');
  return `FACT_${series}-${n}.${ext}`;
}

/**
 * Recoger datos desde un <form>.
 * Compatibilidad: puede llamarse SIN argumentos (detecta automáticamente el form).
 * Intenta resolver 'serie/numero' desde múltiples nombres de campo o data-attrs.
 */
export function collectInvoiceFromForm(form?: HTMLFormElement | null): CollectedInvoice {
  if (typeof window === 'undefined') {
    // En SSR no hay DOM; devolvemos estructura vacía segura
    return {};
  }

  // Autodetección si no se pasa form:
  let target: HTMLFormElement | null = form ?? null;
  if (!target) {
    // prioridad 1: form marcado para facturas
    target = document.querySelector('form[data-invoice-form]') as HTMLFormElement | null;
  }
  if (!target) {
    // prioridad 2: id común
    target = document.getElementById('invoice-form') as HTMLFormElement | null;
  }
  if (!target) {
    // prioridad 3: primer <form> del documento
    target = document.querySelector('form') as HTMLFormElement | null;
  }
  if (!target) {
    return {};
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

  // SERIE y NÚMERO desde varios nombres posibles
  const serieStr =
    pick(['serie', 'series', 'invoice_series', 'invoiceSeries']) ??
    (target.dataset ? target.dataset.series : undefined);
  const numeroStr =
    pick(['numero', 'number', 'invoice_number', 'invoiceNumber']) ??
    (target.dataset ? target.dataset.number : undefined);

  const serie = serieStr ? String(serieStr).trim() : undefined;
  const numeroParsed = numeroStr ? Number(numeroStr) : NaN;
  const numero = Number.isFinite(numeroParsed) ? numeroParsed : undefined;

  const collected: CollectedInvoice = {
    issueDate,
    type,
    totals: { base, tax, total },
    // exponemos tanto en ES como EN para máxima compatibilidad
    serie,
    numero,
    series: serie,
    number: numero,
  };

  return collected;
}

// ============================ Veri*factu (RF/QR) ===========================

/**
 * Alta Veri*factu "light": construye el RF y opcionalmente genera un QR (DataURL).
 * Si necesitas enviar a AEAT, hazlo en otra función; aquí no llamamos a endpoints externos.
 */
import type { VeriFactuPayload } from './verifactu';
import { buildRFString, qrDataUrlFromRF } from './verifactu';

export async function verifactuAlta(
  payload: VeriFactuPayload & { withQR?: boolean }
): Promise<{ rf: string; qrDataUrl: string | null }> {
  const rf = buildRFString(payload);
  let qrDataUrl: string | null = null;

  if (payload.withQR) {
    try {
      qrDataUrl = await qrDataUrlFromRF(rf);
    } catch {
      qrDataUrl = null;
    }
  }

  return { rf, qrDataUrl };
}
