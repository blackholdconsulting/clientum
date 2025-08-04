// app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

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
  firma?: string; // ruta en storage
}

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil>({ idioma: 'Español' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFirma, setUploadingFirma] = useState(false);

  useEffect(() => {
    (async () => {
      // 1) comprueba sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login?callbackUrl=/profile');
        return;
      }

      // 2) intenta leer perfil
      const res = await fetch('/api/usuario/perfil');
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
      } else {
        if (json.perfil) {
          const p: Perfil = json.perfil;

          // si había firma, obtén su URL pública
          if (p.firma) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('firmas').getPublicUrl(p.firma);
            p.firma = publicUrl;
          }
          setPerfil(p);
        } else {
          // no hay perfil: inicializa email desde session.user
          setPerfil((p) => ({
            ...p,
            email: session.user.email ?? '',
          }));
        }
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  const handleChange = (field: keyof Perfil, value: string) => {
    setPerfil((p) => ({ ...p, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload = { ...perfil };
    const res = await fetch('/api/usuario/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error);
    } else {
      // una vez guardado, refresca la ruta actual para recargar datos
      router.refresh();
    }
    setSaving(false);
  };

  const handleFirmaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFirma(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError('No estás autenticado');
      setUploadingFirma(false);
      return;
    }

    const filename = `${session.user.id}/firma.png`;
    const { error: uploadErr } = await supabase.storage
      .from('firmas')
      .upload(filename, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from('firmas').getPublicUrl(filename);
      setPerfil((p) => ({ ...p, firma: publicUrl }));
    }
    setUploadingFirma(false);
  };

  if (loading) {
    return <div className="p-6">Cargando perfil…</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      {/* Campos personales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          Nombre
          <input
            type="text"
            value={perfil.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </label>
        <label className="block">
          Apellidos
          <input
            type="text"
            value={perfil.apellidos || ''}
            onChange={(e) => handleChange('apellidos', e.target.value)}
            className="w-full border rounded p-2 mt-1"
          />
        </label>
      </div>

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={perfil.email || ''}
          readOnly
          className="w-full border rounded p-2 bg-gray-100"
        />
      </div>

      {/* Firma electrónica */}
      <div>
        <h2 className="text-lg font-medium">Firma Electrónica</h2>
        <div className="flex items-center gap-4 mt-2">
          {perfil.firma ? (
            <img
              src={perfil.firma}
              alt="Firma"
              className="h-24 object-contain border"
            />
          ) : (
            <div className="h-24 w-48 bg-gray-100 flex items-center justify-center border">
              Sin firma
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFirmaUpload}
            disabled={uploadingFirma}
            className="border rounded p-2"
          />
        </div>
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
