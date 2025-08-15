'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// IBAN sencillo (genérico). Si quieres ES estricto, afina el regex.
function isValidIban(iban: string) {
  return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban.replace(/\s+/g, '').toUpperCase());
}

export async function saveBillingSettings(formData: FormData) {
  const serie = String(formData.get('invoice_series') ?? '').trim();
  const nextNumber = Number(formData.get('invoice_next_number') ?? 1);
  const resetYearly = formData.get('invoice_number_reset_yearly') === 'on';
  const method = String(formData.get('payment_method_default') ?? 'transfer');
  const iban = String(formData.get('payment_iban') ?? '').trim();
  const paypal = String(formData.get('payment_paypal') ?? '').trim();

  if (!serie) return { ok: false, error: 'La serie no puede estar vacía.' };
  if (!Number.isFinite(nextNumber) || nextNumber < 1) {
    return { ok: false, error: 'El número debe ser ≥ 1.' };
  }
  if ((method === 'transfer' || method === 'domiciliacion') && !isValidIban(iban)) {
    return { ok: false, error: 'IBAN no válido para el método seleccionado.' };
  }
  if (method === 'paypal' && !isValidEmail(paypal)) {
    return { ok: false, error: 'Email de PayPal no válido.' };
  }

  // auth (usuario actual)
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
  if (!userId) return { ok: false, error: 'No autenticado.' };

  // usamos service role para evitar fricciones de RLS al actualizar profiles
  const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabaseSrv
    .from('profiles')
    .update({
      invoice_series: serie,
      invoice_next_number: nextNumber,
      invoice_number_reset_yearly: resetYearly,
      payment_method_default: method,
      payment_iban: iban || null,
      payment_paypal: paypal || null,
    })
    .eq('id', userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
