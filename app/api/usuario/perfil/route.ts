// app/api/usuario/perfil/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

export async function GET() {
  // Inicializa Supabase con las cookies de Next.js
  const supabase = createRouteHandlerClient<Database>({ cookies })

  // Obtiene la sesión actual
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json(
      { success: false, error: 'Auth session missing!' },
      { status: 401 }
    )
  }

  // Lee el perfil asociado al user_id de la sesión
  const { data: perfil, error } = await supabase
    .from('perfil')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (error && error.code === 'PGRST116' /* no rows */) {
    // Si no hay registro aún, devolvemos perfil null
    return NextResponse.json({ success: true, perfil: null })
  }

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, perfil })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json(
      { success: false, error: 'Auth session missing!' },
      { status: 401 }
    )
  }

  const body = await request.json()

  // Prepara el payload, forzando user_id
  const payload = {
    ...body,
    user_id: session.user.id,
    updated_at: new Date().toISOString(),
  }

  // Upsert: inserta o actualiza el registro según user_id
  const { error } = await supabase
    .from('perfil')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
