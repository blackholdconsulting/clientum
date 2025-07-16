// app/api/licenses/create/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  // 1) Autenticamos al usuario (debe ser Admin o el propio user)
  const { data: { session } } = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const userId = session.user.id

  // 2) Generamos la clave y la expiración (por ejemplo, 1 año)
  const key = uuidv4()
  const valid_until = new Date()
  valid_until.setFullYear(valid_until.getFullYear() + 1)

  // 3) Insertamos en la tabla
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      user_id: userId,
      key,
      valid_until: valid_until.toISOString().slice(0,10)
    })
    .single()

  if (error) {
    console.error('Error creando licencia:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 4) Devolvemos la clave y la fecha de expiración
  return NextResponse.json({
    key: data.key,
    valid_until: data.valid_until
  })
}
