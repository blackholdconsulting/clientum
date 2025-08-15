'use client';

import { useState, useTransition } from 'react';
import { saveBillingSettings } from './actions';

type Props = {
  initial: {
    invoice_series: string;
    invoice_next_number: number;
    invoice_number_reset_yearly: boolean;
    payment_method_default: string;
    payment_iban: string | null;
    payment_paypal: string | null;
  };
};

export default function BillingForm({ initial }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setToast(null);
    const res = await saveBillingSettings(formData);
    if (res.ok) setToast('Guardado ✅');
    else setToast(res.error || 'Error al guardar');
  }

  return (
    <form action={(fd) => startTransition(() => onSubmit(fd))} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium">Serie</label>
        <input name="invoice_series" defaultValue={initial.invoice_series} className="mt-1 w-full border rounded p-2" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Siguiente número</label>
          <input name="invoice_next_number" type="number" min={1} defaultValue={initial.invoice_next_number} className="mt-1 w-full border rounded p-2" required />
        </div>
        <label className="flex items-end gap-2">
          <input type="checkbox" name="invoice_number_reset_yearly" defaultChecked={initial.invoice_number_reset_yearly} />
          <span>Reiniciar cada año</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Método de pago por defecto</label>
        <select name="payment_method_default" defaultValue={initial.payment_method_default} className="mt-1 w-full border rounded p-2">
          <option value="transfer">Transferencia</option>
          <option value="domiciliacion">Domiciliación</option>
          <option value="paypal">PayPal</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="efectivo">Efectivo</option>
          <option value="bizum">Bizum</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">IBAN (si aplica)</label>
          <input name="payment_iban" defaultValue={initial.payment_iban ?? ''} className="mt-1 w-full border rounded p-2" placeholder="ES12 3456 7890 1234 5678 9012" />
        </div>
        <div>
          <label className="block text-sm font-medium">PayPal (si aplica)</label>
          <input name="payment_paypal" defaultValue={initial.payment_paypal ?? ''} className="mt-1 w-full border rounded p-2" placeholder="email@paypal.com" />
        </div>
      </div>

      <button disabled={isPending} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {isPending ? 'Guardando…' : 'Guardar'}
      </button>

      {toast && (
        <div className="text-sm mt-2 text-green-700">{toast}</div>
      )}
    </form>
  );
}
