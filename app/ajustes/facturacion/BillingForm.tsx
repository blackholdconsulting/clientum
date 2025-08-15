// app/ajustes/facturacion/BillingForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { saveBillingSettings, type SaveBillingResult } from './actions';
import { useRouter } from 'next/navigation';

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
    payment_iban: string;
    payment_paypal: string;
  };
};

export default function BillingForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setToast(null);
    const r: SaveBillingResult = await saveBillingSettings(fd);
    setToast(r.ok ? 'Guardado ✅' : r.error || 'Error al guardar');
    if (r.ok) {
      // Refresca server components y deja constancia para otras pantallas
      startTransition(() => router.refresh());
      try { localStorage.setItem('billing:lastSaved', String(Date.now())); } catch {}
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl border p-4 space-y-6">
      {/* Series y numeración */}
      <section>
        <h2 className="font-medium mb-3">Series y numeración</h2>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded p-3 border">
            <div className="font-semibold mb-2">Factura completa</div>
            <label className="block text-sm">Serie</label>
            <input name="invoice_series_full" defaultValue={initial.invoice_series_full} className="mt-1 w-full border rounded p-2" />
            <label className="block text-sm mt-2">Siguiente número</label>
            <input name="invoice_next_number_full" type="number" min={1} defaultValue={initial.invoice_next_number_full} className="mt-1 w-full border rounded p-2" />
          </div>

          <div className="bg-slate-50 rounded p-3 border">
            <div className="font-semibold mb-2">Factura simplificada</div>
            <label className="block text-sm">Serie</label>
            <input name="invoice_series_simplified" defaultValue={initial.invoice_series_simplified} className="mt-1 w-full border rounded p-2" />
            <label className="block text-sm mt-2">Siguiente número</label>
            <input name="invoice_next_number_simplified" type="number" min={1} defaultValue={initial.invoice_next_number_simplified} className="mt-1 w-full border rounded p-2" />
          </div>

          <div className="bg-slate-50 rounded p-3 border">
            <div className="font-semibold mb-2">Factura rectificativa</div>
            <label className="block text-sm">Serie</label>
            <input name="invoice_series_rectified" defaultValue={initial.invoice_series_rectified} className="mt-1 w-full border rounded p-2" />
            <label className="block text-sm mt-2">Siguiente número</label>
            <input name="invoice_next_number_rectified" type="number" min={1} defaultValue={initial.invoice_next_number_rectified} className="mt-1 w-full border rounded p-2" />
          </div>
        </div>

        <label className="inline-flex gap-2 items-center mt-3">
          <input name="invoice_number_reset_yearly" type="checkbox" defaultChecked={initial.invoice_number_reset_yearly} />
          <span>Reiniciar numeración al cambiar de año</span>
        </label>
      </section>

      {/* Pago por defecto */}
      <section className="space-y-3">
        <h2 className="font-medium">Forma de pago por defecto</h2>
        <select name="payment_method_default" defaultValue={initial.payment_method_default} className="border rounded p-2">
          <option value="transfer">Transferencia</option>
          <option value="domiciliacion">Domiciliación</option>
          <option value="paypal">PayPal</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="efectivo">Efectivo</option>
          <option value="bizum">Bizum</option>
          <option value="otro">Otro</option>
        </select>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">IBAN (transferencia/domiciliación)</label>
            <input name="payment_iban" defaultValue={initial.payment_iban} className="mt-1 w-full border rounded p-2" placeholder="ES00 0000 0000 00 0000000000" />
          </div>
          <div>
            <label className="block text-sm">Email PayPal (si aplica)</label>
            <input name="payment_paypal" type="email" defaultValue={initial.payment_paypal} className="mt-1 w-full border rounded p-2" />
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-500">{toast}</div>
        <button disabled={pending} className="px-4 py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50">
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
