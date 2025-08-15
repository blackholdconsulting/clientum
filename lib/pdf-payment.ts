export type PaymentMethod =
  | 'transfer' | 'domiciliacion' | 'paypal' | 'tarjeta' | 'efectivo' | 'bizum' | 'otro';

export function formatPaymentBlock(
  method: PaymentMethod,
  { iban, paypal, other }: { iban?: string | null; paypal?: string | null; other?: string | null }
) {
  switch (method) {
    case 'transfer':
      return `Forma de pago: Transferencia\nIBAN: ${iban ?? ''}`;
    case 'domiciliacion':
      return `Forma de pago: Domiciliación bancaria\nIBAN: ${iban ?? ''}`;
    case 'paypal':
      return `Forma de pago: PayPal\nCuenta: ${paypal ?? ''}`;
    case 'tarjeta':
      return `Forma de pago: Tarjeta`;
    case 'efectivo':
      return `Forma de pago: Efectivo`;
    case 'bizum':
      return `Forma de pago: Bizum`;
    case 'otro':
    default:
      return `Forma de pago: Otro\n${other ?? ''}`;
  }
}
