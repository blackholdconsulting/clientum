// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hasToken =
      window.location.search.includes('access_token') ||
      window.location.hash.includes('access_token')

    if (hasToken) {
      supabase.auth
        .getSessionFromUrl({ storeSession: true })
        .then(({ error }) => {
          if (error) console.error('Error Magic Link:', error)
          router.replace(window.location.pathname)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [supabase, router])

  if (loading) return <p>Cargando sesión…</p>
  if (session) return <div>🎉 ¡Bienvenido, {session.user.email}!</div>

  return <LoginForm />
}

function LoginForm() {
  const supabase = useSupabaseClient()
  const [email, setEmail] = useState('')

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin }
        })
        alert('✉️ Revisa tu correo para el enlace mágico')
      }}
    >
      <input
        type="email"
        placeholder="tu@ejemplo.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit">Enviar Magic Link</button>
    </form>
  )
}
