export type VeriFactuPayload = {
  issuerTaxId: string;         // NIF emisor
  issueDate: string;           // YYYY-MM-DD
  invoiceType: 'completa' | 'simplificada' | 'rectificativa';
  total: number;               // importe total factura
  software: string;            // p.ej. "Clientum Signer v0.0.1"
  series: string;
  number: number;
};

// RF “amigable”. Ajusta si tienes especificación oficial distinta.
export function buildRFString(p: VeriFactuPayload): string {
  const t = p.invoiceType[0]?.toUpperCase() ?? 'C';
  return [
    'RF',
    p.issuerTaxId,
    p.issueDate.replaceAll('-', ''),
    `${p.series}-${String(p.number).padStart(6, '0')}`,
    t,
    `T${(p.total ?? 0).toFixed(2)}`
  ].join('|');
}

// QR opcional (sin dependencia fuerte)
export async function qrDataUrlFromRF(rf: string): Promise<string> {
  try {
    const QR = await import('qrcode'); // npm i qrcode (opcional)
    return await QR.toDataURL(rf, { margin: 1, scale: 4 });
  } catch {
    // Si no está 'qrcode' instalado, devolvemos string vacío (no rompe)
    return '';
  }
}
