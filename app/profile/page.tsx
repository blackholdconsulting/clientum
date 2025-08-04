// app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Perfil {
  id?: string;
  user_id?: string;
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  idioma?: string;
  nombre_empresa?: string;
  nif?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  cp?: string;
  pais?: string;
  email?: string;
  web?: string;
  firma?: string;
}

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial del perfil
  useEffect(() => {
    const load = async () => {
      const { data, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !data.session) {
        router.replace('/auth/login?callbackUrl=/profile');
        return;
      }

      const res = await fetch('/api/usuario/perfil');
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
      } else if (json.perfil) {
        setPerfil(json.perfil);
      }
      setLoading(false);
    };
    load();
  }, [router, supabase]);

  const handleChange = (field: keyof Perfil, value: string) => {
    setPerfil(p => ({ ...p, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/usuario/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-6">Cargando perfil…</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Mi perfil</h1>
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            value={perfil.nombre || ''}
            onChange={e => handleChange('nombre', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Apellidos</label>
          <input
            type="text"
            value={perfil.apellidos || ''}
            onChange={e => handleChange('apellidos', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            type="text"
            value={perfil.telefono || ''}
            onChange={e => handleChange('telefono', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Idioma</label>
          <select
            value={perfil.idioma || 'Español'}
            onChange={e => handleChange('idioma', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option>Español</option>
            <option>Inglés</option>
            <option>Francés</option>
          </select>
        </div>
        {/* Aquí añades más campos según tu tabla perfil */}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`mt-6 px-4 py-2 rounded text-white ${
          saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saving ? 'Guardando…' : 'Guardar perfil'}
      </button>
    </div>
  );
}
