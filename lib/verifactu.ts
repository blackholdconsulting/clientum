// lib/verifactu.ts
import { toDataURL } from 'qrcode';

export type InvoiceTypeVF = 'completa' | 'simplificada' | 'rectificativa';

export type VeriFactuPayload = {
  issuerTaxId: string;       // NIF emisor
  issueDate: string;         // YYYY-MM-DD
  total: number;             // importe total con dos decimales
  invoiceType: InvoiceTypeVF;
  software: string;          // identificación del software
  series: string;            // serie asignada
  number: number;            // número asignado
  rf?: string;               // Registro de Facturación devuelto por AEAT (cuando exista)
};

// Mapeo corto del tipo para el QR (no oficial, pero comúnmente usado)
export function typeCode(t: InvoiceTypeVF): 'FC' | 'FS' | 'FR' {
  if (t === 'simplificada') return 'FS';
  if (t === 'rectificativa') return 'FR';
  return 'FC';
}

/**
 * Construye la cadena que irá dentro del QR.
 * Incluye RF cuando está disponible.
 * Ejemplo:
 * RF=AB12...;NIF=12345678Z;F=2025-08-15;IMP=123.45;T=FC;SW=Clientum Signer v0.0.1;S=FAC;N=27
 */
export function buildRFString(p: VeriFactuPayload): string {
  const parts = [
    p.rf ? `RF=${p.rf}` : null,
    `NIF=${p.issuerTaxId}`,
    `F=${p.issueDate}`,
    `IMP=${p.total.toFixed(2)}`,
    `T=${typeCode(p.invoiceType)}`,
    `SW=${p.software}`,
    `S=${p.series}`,
    `N=${p.number}`,
  ].filter(Boolean) as string[];

  return parts.join(';');
}

/** Data URL PNG desde la cadena QR */
export async function qrDataUrlFromRF(rfString: string): Promise<string> {
  // margen 0 y corrección M para un QR compacto de factura
  return await toDataURL(rfString, { errorCorrectionLevel: 'M', margin: 0 });
}
