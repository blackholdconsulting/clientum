// app/api/facturas/numero/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Type = 'completa' | 'simplificada' | 'rectificativa';

export async function GET(req: Request) {
  try {
    // ¡Ojo! Usar el constructor global URL (no una constante llamada igual)
    const urlObj = new globalThis.URL(req.url);
    const t = (urlObj.searchParams.get('type') as Type) || 'completa';

    // ---- Auth: por header Bearer o por cookies ----
    const cookieStore = cookies();
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    const tokenFromHeader =
      authHeader && authHeader.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : undefined;

    // Nota: según versión de Supabase, 'supabase-auth-token' puede ser JSON; aquí usamos las cookies clásicas
    const tokenFromCookie =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      cookieStore.get('supabase-auth-token')?.value ??
      undefined;

    const accessToken = tokenFromHeader ?? tokenFromCookie;

    const supaAnon = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false },
    });
    const { data: u } = await supaAnon.auth.getUser(accessToken);
    const userId = u?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // ---- Leer ajustes del perfil ----
    const supaSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: p, error } = await supaSrv
      .from('profiles')
      .select(
        `
        invoice_series_full, invoice_next_number_full,
        invoice_series_simplified, invoice_next_number_simplified,
        invoice_series_rectified, invoice_next_number_rectified,
        invoice_number_reset_yearly, invoice_last_year
      `
      )
      .eq('id', userId)
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
