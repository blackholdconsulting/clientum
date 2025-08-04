// app/auth/login/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Leer callbackUrl y redirigir si ya hay sesión
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get('callbackUrl');
      if (cb) setCallbackUrl(cb);
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(callbackUrl);
      }
    });
  }, [router, supabase, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (err) {
      console.error('Login error:', err);
      setError(err.message);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Iniciar sesión</h1>
        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-100 p-2 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
