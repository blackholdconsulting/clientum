// app/api/facturas/numero/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

type Type = 'completa' | 'simplificada' | 'rectificativa';

export async function GET(req: Request) {
  try {
    // Usa el helper oficial: lee sesión del request automáticamente (cookies)
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const t = (url.searchParams.get('type') as Type) || 'completa';

    // RLS: necesitas las policies de SELECT sobre profiles id=auth.uid() (ya te las pasé)
    const { data: p, error } = await supabase
      .from('profiles')
      .select(`
        invoice_series_full, invoice_next_number_full,
        invoice_series_simplified, invoice_next_number_simplified,
        invoice_series_rectified, invoice_next_number_rectified,
        invoice_number_reset_yearly, invoice_last_year
      `)
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    const currYear = new Date().getFullYear();
    const reset =
      !!p?.invoice_number_reset_yearly && (p?.invoice_last_year ?? currYear) !== currYear;

    let series = 'FAC';
    let number = 1;

    if (t === 'simplificada') {
      series = p?.invoice_series_simplified ?? 'FACS';
      number = reset ? 1 : p?.invoice_next_number_simplified ?? 1;
    } else if (t === 'rectificativa') {
      series = p?.invoice_series_rectified ?? 'FAR';
      number = reset ? 1 : p?.invoice_next_number_rectified ?? 1;
    } else {
      series = p?.invoice_series_full ?? 'FAC';
      number = reset ? 1 : p?.invoice_next_number_full ?? 1;
    }

    return NextResponse.json({ series, number });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
