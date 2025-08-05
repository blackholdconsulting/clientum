// app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, ChangeEvent } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

interface Perfil {
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
  firma?: string; // ruta interna en storage
}

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const [perfil, setPerfil] = useState<Perfil>({ idioma: 'Español' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFirma, setUploadingFirma] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);

  // Carga perfil al montar
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/usuario/perfil');
        const json = await res.json();
        if (!json.success) {
          setError(json.error);
        } else if (json.perfil) {
          const p: Perfil = json.perfil;
          if (p.firma) {
            const { data: { publicUrl } } = supabase
              .storage.from('firmas')
              .getPublicUrl(p.firma);
            p.firma = publicUrl;
          }
          setPerfil(p);
        } else {
          // Sin perfil previo: precargar email
          const { data: { session } } = await supabase.auth.getSession();
          setPerfil(p => ({ ...p, email: session?.user.email || '' }));
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  const handleChange = (k: keyof Perfil, v: string) =>
    setPerfil(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/usuario/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfil),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadFirma = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFirma(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');
      const key = `${session.user.id}/firma.png`;
      const { error: upErr } = await supabase
        .storage.from('firmas')
        .upload(key, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('firmas').getPublicUrl(key);
      setPerfil(p => ({ ...p, firma: publicUrl }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploadingFirma(false);
    }
  };

  if (loading) return <div className="p-6">Cargando perfil…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      {error && <div className="text-red-700 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-100 p-2 rounded">Perfil guardado ✔️</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          Nombre
          <input
            type="text"
            value={perfil.nombre||''}
            onChange={e=>handleChange('nombre', e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Apellidos
          <input
            type="text"
            value={perfil.apellidos||''}
            onChange={e=>handleChange('apellidos', e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block sm:col-span-2">
          Teléfono
          <input
            type="text"
            value={perfil.telefono||''}
            onChange={e=>handleChange('telefono', e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block sm:col-span-2">
          Idioma
          <select
            value={perfil.idioma||'Español'}
            onChange={e=>handleChange('idioma', e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            <option>Español</option>
            <option>Inglés</option>
            <option>Francés</option>
          </select>
        </label>
      </div>

      <div>
        <label className="block">Email</label>
        <input
          type="email"
          value={perfil.email||''}
          readOnly
          className="w-full border p-2 rounded bg-gray-100 mt-1"
        />
      </div>

      <h2 className="text-lg font-medium">Firma Digital</h2>
      <div className="flex items-center gap-4">
        {perfil.firma ? (
          <img src={perfil.firma} alt="Firma" className="h-24 border" />
        ) : (
          <div className="h-24 w-48 bg-gray-100 flex items-center justify-center border">
            Sin firma
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={uploadFirma}
          disabled={uploadingFirma}
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`mt-4 px-4 py-2 rounded text-white ${
          saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saving ? 'Guardando…' : 'Guardar perfil'}
      </button>
    </div>
  );
}
