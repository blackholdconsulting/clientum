// app/providers.tsx
'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { ReactNode, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

export function Providers({
  children,
  initialSession
}: {
  children: ReactNode
  initialSession: Session | null
}) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  )
}
