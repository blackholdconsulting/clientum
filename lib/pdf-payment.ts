export type PaymentMethod =
  | 'transfer'
  | 'direct_debit'
  | 'paypal'
  | 'card'
  | 'cash'
  | 'bizum'
  | 'other';

export function formatPaymentForPdf(
  method: PaymentMethod,
  iban: string | null,
  paypalEmail: string | null,
  notes?: string | null
): { title: string; lines: string[] } {
  const lines: string[] = [];
  let title = 'Forma de pago';

  switch (method) {
    case 'transfer':
      lines.push('Transferencia bancaria');
      if (iban) lines.push(`IBAN: ${iban}`);
      break;
    case 'direct_debit':
      lines.push('Domiciliación bancaria');
      if (iban) lines.push(`IBAN: ${iban}`);
      break;
    case 'paypal':
      lines.push('PayPal');
      if (paypalEmail) lines.push(`Cuenta: ${paypalEmail}`);
      break;
    case 'card':
      lines.push('Tarjeta');
      break;
    case 'cash':
      lines.push('Efectivo');
      break;
    case 'bizum':
      lines.push('Bizum');
      break;
    default:
      lines.push('Otro');
  }

  if (notes) lines.push(notes);
  return { title, lines };
}
