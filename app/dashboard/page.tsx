'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Listener para detectar inicio de sesión desde el magic link
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);
  
  const handleLogin = async () => {
    const email = prompt('Introduce tu email para recibir el enlace mágico');
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      },
    });

    if (error) {
      alert('Error al enviar el enlace. Revisa tu correo.');
      console.error(error);
    } else {
      alert('Revisa tu correo. Te hemos enviado un enlace mágico para entrar.');
    }
  };

  if (loading) return null;

  return (
    <main className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Clientum</h1>
      <p className="text-gray-600 mb-6">
        Gestiona tu negocio como un profesional. Inicia sesión para comenzar.
      </p>
      <button
        onClick={handleLogin}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium"
      >
        Enviar enlace mágico
      </button>
    </main>
  );
}
