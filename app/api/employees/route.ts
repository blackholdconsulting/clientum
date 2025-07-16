// app/employees/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('employees')
    .select('*')
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies })
  const body = await req.json()
  const { data, error } = await supabase
    .from('employees')
    .insert([body])
    .select()
    .single()
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
