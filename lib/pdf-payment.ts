// lib/pdf-payment.ts

export type PaymentMethod =
  | 'transfer'
  | 'domiciliacion'
  | 'paypal'
  | 'tarjeta'
  | 'efectivo'
  | 'bizum'
  | 'otro';

export function paymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'transfer':      return 'Transferencia';
    case 'domiciliacion': return 'Domiciliación bancaria';
    case 'paypal':        return 'PayPal';
    case 'tarjeta':       return 'Tarjeta';
    case 'efectivo':      return 'Efectivo';
    case 'bizum':         return 'Bizum';
    case 'otro':
    default:              return 'Otro';
  }
}

/**
 * Bloque “Forma de pago” para el PDF (texto multilínea).
 * Usar SIEMPRE con objeto de opciones: { iban?, paypal?, other? }
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

// Alias por compatibilidad histórica
export const formatPaymentBlock = formatPaymentForPdf;
