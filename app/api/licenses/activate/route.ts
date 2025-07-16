export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('🔍 SUPABASE_URL =', url);
  console.log('🔍 SERVICE_ROLE_KEY =', key);

  if (!url || !key) {
    return NextResponse.json({ error: 'Credenciales faltantes' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
