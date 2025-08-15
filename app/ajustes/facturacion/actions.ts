// app/ajustes/facturacion/actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Función interna con la lógica; la exportamos con dos nombres para
// ser compatible con page.tsx (saveSettings) y BillingForm.tsx (saveBillingSettings).
async function _saveBilling(formData: FormData) {
  'use server';

  const supa = createServerActionClient({ cookies });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) {
    redirect('/auth/login?next=/ajustes/facturacion');
  }

  // Helpers de normalización
  const toInt = (v: FormDataEntryValue | null) =>
    Math.max(1, Number(String(v ?? '1').replace(/\D/g, '') || '1'));

  const payload = {
    id: user!.id,

    // Series + numeración por tipo
    invoice_series_full: String(formData.get('invoice_series_full') ?? 'FAC').trim() || 'FAC',
    invoice_next_number_full: toInt(formData.get('invoice_next_number_full')),

    invoice_series_simplified: String(formData.get('invoice_series_simplified') ?? 'FACS').trim() || 'FACS',
    invoice_next_number_simplified: toInt(formData.get('invoice_next_number_simplified')),

    invoice_series_rectified: String(formData.get('invoice_series_rectified') ?? 'FAR').trim() || 'FAR',
    invoice_next_number_rectified: toInt(formData.get('invoice_next_number_rectified')),

    invoice_number_reset_yearly: formData.get('invoice_number_reset_yearly') === 'on',

    // Pagos por defecto
    payment_method_default: String(formData.get('payment_method_default') ?? 'transfer'),
    payment_iban: (formData.get('payment_iban') as string | null) || null,
    payment_paypal: (formData.get('payment_paypal') as string | null) || null,
  };

  // Validaciones mínimas
  const method = payload.payment_method_default;
  if ((method === 'transfer' || method === 'domiciliacion') && !payload.payment_iban) {
    throw new Error('Debes indicar IBAN para transferencia/domiciliación.');
  }
  if (method === 'paypal' && payload.payment_paypal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.payment_paypal)) {
    throw new Error('Email de PayPal no válido.');
  }

  const { error } = await supa.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) throw error;

  // Revalida esta página
  revalidatePath('/ajustes/facturacion');
}

// Export con ambos nombres para que cualquier import existente funcione
export { _saveBilling as saveBillingSettings, _saveBilling as saveSettings };
