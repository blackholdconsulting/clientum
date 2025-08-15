export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import BillingForm from './BillingForm';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SRV  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('sb-access-token')?.value ??
    cookieStore.get('sb:token')?.value ?? undefined;

  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: u } = await anon.auth.getUser(accessToken);
  const userId = u?.user?.id;
  if (!userId) return <main className="p-6">Debes iniciar sesión.</main>;

  const srv = createClient(URL, SRV, { auth: { persistSession: false } });
  const { data: profile } = await srv
    .from('profiles')
    .select(`
      invoice_series_full, invoice_next_number_full,
      invoice_series_simplified, invoice_next_number_simplified,
      invoice_series_rectified, invoice_next_number_rectified,
      invoice_number_reset_yearly,
      payment_method_default, payment_iban, payment_paypal
    `)
    .eq('id', userId)
    .maybeSingle();

  const initial = profile ?? {
    invoice_series_full: 'FAC',
    invoice_next_number_full: 1,
    invoice_series_simplified: 'FACS',
    invoice_next_number_simplified: 1,
    invoice_series_rectified: 'FAR',
    invoice_next_number_rectified: 1,
    invoice_number_reset_yearly: true,
    payment_method_default: 'transfer',
    payment_iban: null,
    payment_paypal: null,
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Ajustes de facturación</h1>
      <p className="text-sm text-gray-600 mb-6">Define series y numeración por tipo (FAC, FACS, FAR) y el método de pago por defecto.</p>
      <BillingForm initial={initial} />
    </main>
  );
}
