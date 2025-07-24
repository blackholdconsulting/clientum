// app/auth/callback/route.ts
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
  }

  const supabase = createRouteHandlerClient({ cookies })
  await supabase.auth.exchangeCodeForSession(code)

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
