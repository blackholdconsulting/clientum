'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Session } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthHandler() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function handleMagicLink() {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        router.replace(window.location.pathname);
      }
    }
    handleMagicLink();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [searchParams, supabase, router]);

  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl mb-4">Bienvenido a Clientum</h1>
        <button
          onClick={() =>
            supabase.auth.signInWithOtp({ email: window.prompt('Introduce tu email:') || '' })
          }
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Enviar enlace mágico
        </button>
      </div>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <p>
        Estás autenticado como <strong>{session.user.email}</strong>.
      </p>
      <button
        onClick={() => supabase.auth.signOut().then(() => setSession(null))}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
