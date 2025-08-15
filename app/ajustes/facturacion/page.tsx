export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import BillingForm from './BillingForm';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('sb-access-token')?.value ??
    cookieStore.get('sb:token')?.value ??
    undefined;

  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userRes } = await supabaseAnon.auth.getUser(accessToken);
  const userId = userRes?.user?.id;

  if (!userId) {
    return <main className="p-6">Debes iniciar sesión.</main>;
  }

  const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile } = await supabaseSrv
    .from('profiles')
    .select('invoice_series, invoice_next_number, invoice_number_reset_yearly, payment_method_default, payment_iban, payment_paypal')
    .eq('id', userId)
    .maybeSingle();

  const initial = profile ?? {
    invoice_series: 'A',
    invoice_next_number: 1,
    invoice_number_reset_yearly: true,
    payment_method_default: 'transfer',
    payment_iban: null,
    payment_paypal: null,
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Ajustes de facturación</h1>
      <p className="text-sm text-gray-600 mb-6">
        Serie y numeración de facturas, y método de pago por defecto.
      </p>
      <BillingForm initial={initial} />
    </main>
  );
}
