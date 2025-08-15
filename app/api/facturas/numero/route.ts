// app/api/facturas/numero/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SRV  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Type = 'completa'|'simplificada'|'rectificativa';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const t = (url.searchParams.get('type') as Type) || 'completa';

    // Auth: Bearer o cookies
    const cookieStore = await cookies();
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    const tokenFromHeader =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : undefined;
    const tokenFromCookie =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      cookieStore.get('supabase-auth-token')?.value ??
      undefined;
    const accessToken = tokenFromHeader ?? tokenFromCookie;

    const anon = createClient(URL, ANON, { auth: { persistSession: false } });
    const { data: u } = await anon.auth.getUser(accessToken);
    const userId = u?.user?.id;
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    // Leer perfil
    const srv = createClient(URL, SRV, { auth: { persistSession: false } });
    const { data: p, error } = await srv
      .from('profiles')
      .select(`
        invoice_series_full, invoice_next_number_full,
        invoice_series_simplified, invoice_next_number_simplified,
        invoice_series_rectified, invoice_next_number_rectified,
        invoice_number_reset_yearly, invoice_last_year
      `)
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;

    const currYear = new Date().getFullYear();
    const reset = !!p?.invoice_number_reset_yearly && (p?.invoice_last_year ?? currYear) !== currYear;

    let series = 'FAC';
    let number = 1;
    if (t === 'completa') {
      series = p?.invoice_series_full ?? 'FAC';
      number = reset ? 1 : (p?.invoice_next_number_full ?? 1);
    } else if (t === 'simplificada') {
      series = p?.invoice_series_simplified ?? 'FACS';
      number = reset ? 1 : (p?.invoice_next_number_simplified ?? 1);
    } else {
      series = p?.invoice_series_rectified ?? 'FAR';
      number = reset ? 1 : (p?.invoice_next_number_rectified ?? 1);
    }

    return NextResponse.json({ series, number });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 });
  }
}
