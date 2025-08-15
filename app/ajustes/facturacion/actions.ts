// app/ajustes/facturacion/actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';

export type SaveBillingResult =
  | { ok: true }
  | { ok: false; error: string };

async function _saveBilling(formData: FormData): Promise<SaveBillingResult> {
  const supa = createServerActionClient({ cookies });
  const { data: { user }, error: authErr } = await supa.auth.getUser();

  if (authErr || !user) {
    return { ok: false, error: 'No autenticado' };
  }

  // Helpers
  const toInt = (v: FormDataEntryValue | null) =>
    Math.max(1, Number(String(v ?? '1').replace(/\D/g, '') || '1'));

  const payload = {
    id: user.id,

    // Series + numeración por tipo
    invoice_series_full: String(formData.get('invoice_series_full') ?? 'FAC').trim() || 'FAC',
    invoice_next_number_full: toInt(formData.get('invoice_next_number_full')),

    invoice_series_simplified: String(formData.get('invoice_series_simplified') ?? 'FACS').trim() || 'FACS',
    invoice_next_number_simplified: toInt(formData.get('invoice_next_number_simplified')),

    invoice_series_rectified: String(formData.get('invoice_series_rectified') ?? 'FAR').trim() || 'FAR',
    invoice_next_number_rectified: toInt(formData.get('invoice_next_number_rectified')),

    invoice_number_reset_yearly: formData.get('invoice_number_reset_yearly') === 'on',

    // Pago por defecto
    payment_method_default: String(formData.get('payment_method_default') ?? 'transfer'),
    payment_iban: (formData.get('payment_iban') as string | null) || null,
    payment_paypal: (formData.get('payment_paypal') as string | null) || null,
  };

  // Validaciones mínimas con retorno de error legible
  const method = payload.payment_method_default;
  if ((method === 'transfer' || method === 'domiciliacion') && !payload.payment_iban) {
    return { ok: false, error: 'Debes indicar IBAN para transferencia/domiciliación.' };
  }
  if (method === 'paypal' && payload.payment_paypal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.payment_paypal)) {
    return { ok: false, error: 'Email de PayPal no válido.' };
  }

  const { error } = await supa.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) {
    return { ok: false, error: error.message || 'Error guardando ajustes' };
  }

  // Revalida la página para reflejar cambios
  revalidatePath('/ajustes/facturacion');
  return { ok: true };
}

// Export con ambos nombres para mantener compatibilidad
export { _saveBilling as saveBillingSettings, _saveBilling as saveSettings };
