// lib/pdf-payment.ts

// Métodos admitidos en la UI
export type PaymentMethod =
  | 'transfer'
  | 'domiciliacion'
  | 'paypal'
  | 'tarjeta'
  | 'efectivo'
  | 'bizum'
  | 'otro';

// Etiqueta legible para el PDF
export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'transfer':
      return 'Transferencia';
    case 'domiciliacion':
      return 'Domiciliación bancaria';
    case 'paypal':
      return 'PayPal';
    case 'tarjeta':
      return 'Tarjeta';
    case 'efectivo':
      return 'Efectivo';
    case 'bizum':
      return 'Bizum';
    case 'otro':
    default:
      return 'Otro';
  }
}

/**
 * Bloque de “Forma de pago” listo para inyectar en el PDF (string multilinea).
 * - Si método = transferencia/domiciliación → muestra IBAN
 * - Si método = paypal → muestra email
 * - Otros → muestra etiqueta y texto libre si se pasa
 */
export function formatPaymentForPdf(
  method: PaymentMethod,
  opts: { iban?: string | null; paypal?: string | null; other?: string | null } = {}
): string {
  const label = paymentMethodLabel(method);
  const iban = (opts.iban ?? '').trim();
  const paypal = (opts.paypal ?? '').trim();
  const other = (opts.other ?? '').trim();

  switch (method) {
    case 'transfer':
      return `Forma de pago: ${label}\n${iban ? `IBAN: ${iban}` : ''}`.trim();
    case 'domiciliacion':
      return `Forma de pago: ${label}\n${iban ? `IBAN: ${iban}` : ''}`.trim();
    case 'paypal':
      return `Forma de pago: ${label}\n${paypal ? `Cuenta: ${paypal}` : ''}`.trim();
    case 'tarjeta':
    case 'efectivo':
    case 'bizum':
      return `Forma de pago: ${label}`;
    case 'otro':
    default:
      return `Forma de pago: ${label}${other ? `\n${other}` : ''}`;
  }
}

/**
 * Alias mantenido por compatibilidad con código anterior.
 * Hace exactamente lo mismo que formatPaymentForPdf.
 */
export const formatPaymentBlock = formatPaymentForPdf;
