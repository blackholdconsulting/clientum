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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get('callbackUrl');
      if (cb) setCallbackUrl(cb);
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session at mount:', session);
      if (session) router.replace(callbackUrl);
    });
  }, [router, supabase, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 handleSubmit fired for', email);
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    console.log('📨 Supabase returned:', { data, err });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Iniciar sesión</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <label className="block">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
