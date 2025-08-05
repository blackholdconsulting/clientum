// app/api/usuario/perfil/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies: () => request.headers.get('cookie') ?? '' });
  const {
    data: { session },
    error: sessErr,
  } = await supabase.auth.getSession();

  if (sessErr || !session) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const { data: perfil, error } = await supabase
    .from('perfil')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!perfil) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true, perfil });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies: () => request.headers.get('cookie') ?? '' });
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: 'JSON inválido' }, { status: 400 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  const { error } = await supabase
    .from('perfil')
    .upsert({ ...body, user_id: session.user.id }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
