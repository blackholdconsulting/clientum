// lib/invoice-signer.ts
// Helpers de firma + compatibilidad con páginas existentes.
// Evita dependencias nuevas e intenta ser isomórfico (cliente/servidor).
// Solo 'downloadBlob' exige navegador.

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
  // Si tu app ya define la función real en algún sitio y la expone global, úsala:
  if ((globalThis as any).__existing_buildFacturaeXml) {
    return (globalThis as any).__existing_buildFacturaeXml(payload);
  }
  // Placeholder mínimo (no usar en prod si no tienes el real):
  return `<?xml version="1.0" encoding="UTF-8"?><Facturae><PlaceHolder/></Facturae>`;
}

// ============================== SHIMS/ALIASES ==============================

// Alias de compatibilidad con páginas que importan este nombre concreto
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

/** Recoger datos mínimos desde un <form>. Amplía según tus campos reales. */
export function collectInvoiceFromForm(form: HTMLFormElement): any {
  const fd = new FormData(form);
  const issueDate = (fd.get('issueDate') as string) || '';
  const type = (fd.get('type') as string) || 'completa';
  const totals = {
    base: Number(fd.get('totalBase') ?? 0),
    tax: Number(fd.get('totalTax') ?? 0),
    total: Number(fd.get('total') ?? 0),
  };
  // Añade aquí mapeo de customer/items/payment/etc. si tu formulario ya los aporta.
  return { issueDate, type, totals };
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

  // Generar QR solo si se solicita explícitamente
  if (payload.withQR) {
    try {
      qrDataUrl = await qrDataUrlFromRF(rf);
    } catch {
      qrDataUrl = null;
    }
  }

  return { rf, qrDataUrl };
}
