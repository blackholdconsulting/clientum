export type VeriFactuPayload = {
  issuerTaxId: string;
  issueDate: string;  // YYYY-MM-DD
  invoiceType: 'completa' | 'simplificada' | 'rectificativa';
  total: number;
  software: string;
  series: string;
  number: number;
};

export function buildRFString(p: VeriFactuPayload): string {
  const totalFixed = Number(p.total).toFixed(2);
  const typeCode =
    p.invoiceType === 'completa' ? 'FAC' : p.invoiceType === 'simplificada' ? 'FS' : 'FR';

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

// Generación de QR (usar en cliente). Requiere 'qrcode' (npm i qrcode)
export async function qrDataUrlFromRF(rf: string): Promise<string> {
  const QRCode = await import('qrcode');
  return await QRCode.toDataURL(rf, { margin: 1, errorCorrectionLevel: 'M', scale: 4 });
}
