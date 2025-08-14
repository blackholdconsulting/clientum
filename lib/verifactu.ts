// lib/verifactu.ts
// Helpers para construir el payload RF y generar QR (lado cliente).
// NOTA: para generar QR usamos dependencia ligera 'qrcode' (solo en cliente via dynamic import).
// Instala si no la tienes: npm i qrcode

export type VeriFactuPayload = {
  issuerTaxId: string;         // NIF del emisor
  issueDate: string;           // YYYY-MM-DD
  invoiceType: 'completa' | 'simplificada' | 'rectificativa';
  total: number;               // importe total con dos decimales
  software: string;            // identificador del software
  series: string;
  number: number;
};

export function buildRFString(p: VeriFactuPayload): string {
  // Estructura sencilla y legible. Si ya tienes payload /aeat, mapea aquí.
  const totalFixed = Number(p.total).toFixed(2);
  const typeCode =
    p.invoiceType === 'completa' ? 'FAC' : p.invoiceType === 'simplificada' ? 'FS' : 'FR';

  // RF mínimo normativo para tu caso (simplificado)
  // Adapta al formato que estés usando en /aeat para mantener consistencia.
  return [
    'RF',
    `NIF=${p.issuerTaxId}`,
    `DATE=${p.issueDate}`,
    `TOTAL=${totalFixed}`,
    `TYPE=${typeCode}`,
    `SERIE=${p.series}`,
    `NUM=${p.number}`,
    `SW=${p.software}`,
  ].join('|');
}

// Genera un DataURL PNG de QR a partir del RF String (solo en cliente)
export async function qrDataUrlFromRF(rf: string): Promise<string> {
  // Carga en cliente (dynamic import) para no inflar el bundle del servidor
  const QRCode = await import('qrcode');
  return await QRCode.toDataURL(rf, {
    margin: 1,
    errorCorrectionLevel: 'M',
    scale: 4,
  });
}
