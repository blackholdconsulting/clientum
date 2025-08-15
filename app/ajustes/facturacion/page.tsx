// app/ajustes/facturacion/page.tsx
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import BillingForm from './BillingForm';

export default async function BillingSettingsPage() {
  const supa = createServerComponentClient({ cookies });
  const { data: { user } } = await supa.auth.getUser();

  if (!user) return <main className="p-6">Debes iniciar sesión.</main>;

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

  const initial = {
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
      <BillingForm initial={initial} />
      <p className="text-sm text-slate-500">
        Al crear una factura se reserva numeración por tipo (FAC/FACS/FAR) y, si está activado, se reinicia al cambiar de año.
      </p>
    </main>
  );
}
