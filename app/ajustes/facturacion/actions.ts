'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidIban(iban: string) {
  return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban.replace(/\s+/g, '').toUpperCase());
}

export async function saveBillingSettings(formData: FormData) {
  const fullSeries = String(formData.get('invoice_series_full') ?? '').trim();
  const fullNext = Number(formData.get('invoice_next_number_full') ?? 1);
  const simpSeries = String(formData.get('invoice_series_simplified') ?? '').trim();
  const simpNext = Number(formData.get('invoice_next_number_simplified') ?? 1);
  const rectSeries = String(formData.get('invoice_series_rectified') ?? '').trim();
  const rectNext = Number(formData.get('invoice_next_number_rectified') ?? 1);

  const resetYearly = formData.get('invoice_number_reset_yearly') === 'on';

  const method = String(formData.get('payment_method_default') ?? 'transfer');
  const iban = String(formData.get('payment_iban') ?? '').trim();
  const paypal = String(formData.get('payment_paypal') ?? '').trim();

  if (!fullSeries || !simpSeries || !rectSeries) return { ok: false, error: 'Las series no pueden estar vacías.' };
  if ([fullNext, simpNext, rectNext].some(n => !Number.isFinite(n) || n < 1)) {
    return { ok: false, error: 'Los números siguientes deben ser ≥ 1.' };
  }
  if ((method === 'transfer' || method === 'domiciliacion') && iban && !isValidIban(iban)) {
    return { ok: false, error: 'IBAN no válido para el método seleccionado.' };
  }
  if (method === 'paypal' && paypal && !isValidEmail(paypal)) {
    return { ok: false, error: 'Email de PayPal no válido.' };
  }

  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('sb-access-token')?.value ??
    cookieStore.get('sb:token')?.value ??
    undefined;

  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data: userRes } = await supabaseAnon.auth.getUser(accessToken);
  const userId = userRes?.user?.id;
  if (!userId) return { ok: false, error: 'No autenticado.' };

  const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { error } = await supabaseSrv
    .from('profiles')
    .upsert({
      id: userId,
      invoice_series_full: fullSeries,
      invoice_next_number_full: fullNext,
      invoice_series_simplified: simpSeries,
      invoice_next_number_simplified: simpNext,
      invoice_series_rectified: rectSeries,
      invoice_next_number_rectified: rectNext,
      invoice_number_reset_yearly: resetYearly,
      payment_method_default: method,
      payment_iban: iban || null,
      payment_paypal: paypal || null,
    }, { onConflict: 'id' });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
