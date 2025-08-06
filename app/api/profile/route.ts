// app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentSupabaseClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const { data: perfil, error } = await supabase
    .from('perfil')
    .select(
      `nombre,apellidos,telefono,idioma,
       nombre_empr,nif,direccion,ciudad,provincia,cp,pais,
       email,web,iban`
    )
    .eq('id', session.user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(perfil)
}
