'use client';

import { useTransition, useState } from 'react';
import { saveBillingSettings } from './actions';

type Props = {
  initial: {
    invoice_series_full: string;
    invoice_next_number_full: number;
    invoice_series_simplified: string;
    invoice_next_number_simplified: number;
    invoice_series_rectified: string;
    invoice_next_number_rectified: number;
    invoice_number_reset_yearly: boolean;
    payment_method_default: string;
    payment_iban: string | null;
    payment_paypal: string | null;
  };
};

export default function BillingForm({ initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  async function onSubmit(fd: FormData) {
    setToast(null);
    const r = await saveBillingSettings(fd);
    setToast(r.ok ? 'Guardado ✅' : r.error || 'Error al guardar');
  }

  return (
    <form action={(fd)=>startTransition(()=>onSubmit(fd))} className="max-w-2xl space-y-6">
      {/* Series por tipo */}
      <fieldset className="border rounded p-4">
        <legend className="px-2 text-sm font-medium">Series y numeración</legend>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Serie (Factura Completa)</label>
            <input name="invoice_series_full" defaultValue={initial.invoice_series_full} className="mt-1 w-full border rounded p-2" required />
          </div>
          <div>
            <label className="text-sm font-medium">Siguiente nº (Completa)</label>
            <input type="number" min={1} name="invoice_next_number_full" defaultValue={initial.invoice_next_number_full} className="mt-1 w-full border rounded p-2" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-sm font-medium">Serie (Simplificada)</label>
            <input name="invoice_series_simplified" defaultValue={initial.invoice_series_simplified} className="mt-1 w-full border rounded p-2" required />
          </div>
          <div>
            <label className="text-sm font-medium">Siguiente nº (Simplificada)</label>
            <input type="number" min={1} name="invoice_next_number_simplified" defaultValue={initial.invoice_next_number_simplified} className="mt-1 w-full border rounded p-2" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-sm font-medium">Serie (Rectificativa)</label>
            <input name="invoice_series_rectified" defaultValue={initial.invoice_series_rectified} className="mt-1 w-full border rounded p-2" required />
          </div>
          <div>
            <label className="text-sm font-medium">Siguiente nº (Rectificativa)</label>
            <input type="number" min={1} name="invoice_next_number_rectified" defaultValue={initial.invoice_next_number_rectified} className="mt-1 w-full border rounded p-2" required />
          </div>
        </div>

        <label className="inline-flex gap-2 items-center mt-3">
          <input type="checkbox" name="invoice_number_reset_yearly" defaultChecked={initial.invoice_number_reset_yearly} />
          Reiniciar cada año
        </label>
      </fieldset>

      {/* Pagos */}
      <fieldset className="border rounded p-4">
        <legend className="px-2 text-sm font-medium">Forma de pago por defecto</legend>
        <div>
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
        <div className="grid grid-cols-2 gap-3 mt-3">
          <input name="payment_iban" placeholder="IBAN (si aplica)" defaultValue={initial.payment_iban ?? ''} className="border rounded p-2" />
          <input name="payment_paypal" placeholder="Email PayPal (si aplica)" defaultValue={initial.payment_paypal ?? ''} className="border rounded p-2" />
        </div>
      </fieldset>

      <button disabled={isPending} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {isPending ? 'Guardando…' : 'Guardar'}
      </button>

      {toast && <div className="text-sm mt-2">{toast}</div>}
    </form>
  );
}
