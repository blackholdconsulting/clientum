// app/ajustes/facturacion/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { saveSettings } from './actions';

export default async function BillingSettingsPage() {
  const supa = createServerComponentClient({ cookies });
  const { data: { user } } = await supa.auth.getUser();

  if (!user) {
    return <main className="p-6">Debes iniciar sesión.</main>;
  }

  // Cargar perfil de facturación
  const { data: profile } = await supa
    .from('profiles')
    .select(`
      id,
      invoice_series_full, invoice_next_number_full,
      invoice_series_simplified, invoice_next_number_simplified,
      invoice_series_rectified, invoice_next_number_rectified,
      invoice_number_reset_yearly,
      payment_method_default, payment_iban, payment_paypal
    `)
    .eq('id', user.id)
    .maybeSingle();

  const p = {
    invoice_series_full: profile?.invoice_series_full ?? 'FAC',
    invoice_next_number_full: profile?.invoice_next_number_full ?? 1,
    invoice_series_simplified: profile?.invoice_series_simplified ?? 'FACS',
    invoice_next_number_simplified: profile?.invoice_next_number_simplified ?? 1,
    invoice_series_rectified: profile?.invoice_series_rectified ?? 'FAR',
    invoice_next_number_rectified: profile?.invoice_next_number_rectified ?? 1,
    invoice_number_reset_yearly: profile?.invoice_number_reset_yearly ?? true,
    payment_method_default: profile?.payment_method_default ?? 'transfer',
    payment_iban: profile?.payment_iban ?? '',
    payment_paypal: profile?.payment_paypal ?? '',
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Ajustes de facturación</h1>

      <form action={saveSettings} className="bg-white rounded-xl border p-4 space-y-6">
        {/* Series y numeración */}
        <section>
          <h2 className="font-medium mb-3">Series y numeración</h2>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded p-3 border">
              <div className="font-semibold mb-2">Factura completa</div>
              <label className="block text-sm">Serie</label>
              <input name="invoice_series_full" defaultValue={p.invoice_series_full} className="mt-1 w-full border rounded p-2" />
              <label className="block text-sm mt-2">Siguiente número</label>
              <input name="invoice_next_number_full" type="number" min={1} defaultValue={p.invoice_next_number_full} className="mt-1 w-full border rounded p-2" />
            </div>

            <div className="bg-slate-50 rounded p-3 border">
              <div className="font-semibold mb-2">Factura simplificada</div>
              <label className="block text-sm">Serie</label>
              <input name="invoice_series_simplified" defaultValue={p.invoice_series_simplified} className="mt-1 w-full border rounded p-2" />
              <label className="block text-sm mt-2">Siguiente número</label>
              <input name="invoice_next_number_simplified" type="number" min={1} defaultValue={p.invoice_next_number_simplified} className="mt-1 w-full border rounded p-2" />
            </div>

            <div className="bg-slate-50 rounded p-3 border">
              <div className="font-semibold mb-2">Factura rectificativa</div>
              <label className="block text-sm">Serie</label>
              <input name="invoice_series_rectified" defaultValue={p.invoice_series_rectified} className="mt-1 w-full border rounded p-2" />
              <label className="block text-sm mt-2">Siguiente número</label>
              <input name="invoice_next_number_rectified" type="number" min={1} defaultValue={p.invoice_next_number_rectified} className="mt-1 w-full border rounded p-2" />
            </div>
          </div>

          <label className="inline-flex gap-2 items-center mt-3">
            <input name="invoice_number_reset_yearly" type="checkbox" defaultChecked={p.invoice_number_reset_yearly} />
            <span>Reiniciar numeración al cambiar de año</span>
          </label>
        </section>

        {/* Pago por defecto */}
        <section className="space-y-3">
          <h2 className="font-medium">Forma de pago por defecto</h2>
          <select name="payment_method_default" defaultValue={p.payment_method_default} className="border rounded p-2">
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
              <input name="payment_iban" defaultValue={p.payment_iban} className="mt-1 w-full border rounded p-2" placeholder="ES00 0000 0000 00 0000000000" />
            </div>
            <div>
              <label className="block text-sm">Email PayPal (si aplica)</label>
              <input name="payment_paypal" type="email" defaultValue={p.payment_paypal} className="mt-1 w-full border rounded p-2" />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-black text-white rounded hover:opacity-90">Guardar</button>
        </div>
      </form>

      <p className="text-sm text-slate-500">
        Al crear una factura se reserva numeración por tipo (FAC/FACS/FAR) y, si está activado, se reinicia al cambiar de año.
      </p>
    </main>
  );
}
