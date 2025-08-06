// app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  // Inicializa Supabase en el server
  const supabase = createServerComponentClient({ cookies })

  // Obtén la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'No session found' },
      { status: 401 }
    )
  }

  // Consulta la tabla "perfil" para el usuario logueado
  const { data: profile, error } = await supabase
    .from('perfil')
    .select(`
      nombre,
      apellidos,
      telefono,
      idioma,
      nombre_empr,
      nif,
      direccion,
      ciudad,
      provincia,
      cp,
      pais,
      email,
      web,
      iban
    `)
    .eq('id', session.user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Devuelve el perfil en JSON
  return NextResponse.json(profile)
}
