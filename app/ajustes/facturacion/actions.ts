'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type PaymentMethod =
  | 'transfer'
  | 'direct_debit'
  | 'paypal'
  | 'card'
  | 'cash'
  | 'bizum'
  | 'other';

export type BillingSettings = {
  invoice_series: string;
  invoice_next_number: number;
  invoice_number_reset_yearly: boolean;
  payment_method_default: PaymentMethod;
  payment_iban: string | null;
  payment_paypal: string | null;
};

export type BillingSettingsInput = BillingSettings;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function isIBAN(value: string): boolean {
  const v = value.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v);
}

export async function saveBillingSettings(
  values: BillingSettingsInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get('sb-access-token')?.value ??
    cookieStore.get('sb:token')?.value ??
    null;

  if (!accessToken) return { ok: false, error: 'No autenticado.' };

  const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userRes, error: userErr } = await supabaseAnon.auth.getUser(accessToken);
  if (userErr || !userRes?.user?.id) return { ok: false, error: 'No se pudo resolver el usuario actual.' };
  const userId = userRes.user.id;

  const series = (values.invoice_series ?? '').trim();
  if (!series) return { ok: false, error: 'La serie no puede estar vacía.' };
  const num = Number(values.invoice_next_number);
  if (!Number.isInteger(num) || num < 1) return { ok: false, error: 'El número debe ser un entero ≥ 1.' };

  const method = values.payment_method_default;
  let payment_iban: string | null = values.payment_iban ? values.payment_iban.trim() : null;
  let payment_paypal: string | null = values.payment_paypal ? values.payment_paypal.trim() : null;

  if (method === 'transfer' || method === 'direct_debit') {
    if (!payment_iban || !isIBAN(payment_iban)) {
      return { ok: false, error: 'IBAN requerido o inválido para el método seleccionado.' };
    }
  } else {
    payment_iban = null;
  }
  if (method === 'paypal') {
    if (!payment_paypal || !isEmail(payment_paypal)) {
      return { ok: false, error: 'Email de PayPal requerido o inválido.' };
    }
  } else {
    payment_paypal = null;
  }

  const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: upErr } = await supabaseSrv
    .from('profiles')
    .update({
      invoice_series: series,
      invoice_next_number: num,
      invoice_number_reset_yearly: !!values.invoice_number_reset_yearly,
      payment_method_default: method,
      payment_iban,
      payment_paypal,
    })
    .eq('id', userId);

  if (upErr) return { ok: false, error: 'Error al guardar ajustes: ' + upErr.message };
  return { ok: true };
}
