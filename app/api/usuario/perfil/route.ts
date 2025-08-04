// app/api/usuario/perfil/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Auth session missing!' }, { status: 401 })
  }

  const body = await request.json()
  const userId = session.user.id

  // 1) ¿Existe ya un perfil?
  const { count, error: countErr } = await supabase
    .from('perfil')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (countErr) {
    return NextResponse.json({ success: false, error: countErr.message }, { status: 500 })
  }

  if (count! > 0) {
    // 2a) Hay perfil: actualizar
    const { error: updErr } = await supabase
      .from('perfil')
      .update(body)
      .eq('user_id', userId)

    if (updErr) {
      return NextResponse.json({ success: false, error: updErr.message }, { status: 500 })
    }
  } else {
    // 2b) No hay perfil: insertar
    const { error: insErr } = await supabase
      .from('perfil')
      .insert([{ ...body, user_id: userId }])

    if (insErr) {
      return NextResponse.json({ success: false, error: insErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
