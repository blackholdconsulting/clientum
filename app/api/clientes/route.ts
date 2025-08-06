// app/api/clientes/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentSupabaseClient({ cookies })
  const { data, error } = await supabase
    .from('clientes')
    .select('id,nombre,direccion,cif,cp,email')
    .order('nombre', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
