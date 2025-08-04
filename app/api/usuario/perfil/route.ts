// app/api/usuario/perfil/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session },
    error: sessErr
  } = await supabase.auth.getSession()

  if (sessErr || !session) {
    return NextResponse.json({ success: false, error: 'Auth session missing!' }, { status: 401 })
  }

  const body = await request.json()
  const userId = session.user.id

  // Comprobamos si ya existe
  const { count, error: countErr } = await supabase
    .from('perfil')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', userId)

  if (countErr) {
    return NextResponse.json({ success: false, error: countErr.message }, { status: 500 })
  }

  if (count! > 0) {
    // Actualizar
    const { error: updErr } = await supabase
      .from('perfil')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message }, { status: 500 })
    }
  } else {
    // Insertar
    const { error: insErr } = await supabase
      .from('perfil')
      .insert([{ ...body, user_id: userId }])

    if (insErr) {
      return NextResponse.json({ success: false, error: insErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
