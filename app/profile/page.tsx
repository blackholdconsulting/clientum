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
  firma?: string; // URL o path en storage
}

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil>({
    idioma: 'Español',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFirma, setUploadingFirma] = useState(false);

  // Carga inicial del perfil
  useEffect(() => {
    const load = async () => {
      // Comprueba sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login?callbackUrl=/profile');
        return;
      }

      // GET a nuestra API
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
    setPerfil((p) => ({ ...p, [field]: value }));
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

  const handleFirmaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFirma(true);
    // Comprueba sesión
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError('No estás autenticado');
      setUploadingFirma(false);
      return;
    }
    const path = `${session.user.id}/firma.png`;
    const { error: uploadError } = await supabase.storage
      .from('firmas')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setError(uploadError.message);
    } else {
      const { data } = supabase.storage.from('firmas').getPublicUrl(path);
      handleChange('firma', data.publicUrl);
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

      {/* Datos personales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            value={perfil.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Apellidos</label>
          <input
            type="text"
            value={perfil.apellidos || ''}
            onChange={(e) => handleChange('apellidos', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            type="text"
            value={perfil.telefono || ''}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Idioma</label>
          <select
            value={perfil.idioma || 'Español'}
            onChange={(e) => handleChange('idioma', e.target.value)}
            className="w-full border rounded p-2"
          >
            <option>Español</option>
            <option>Inglés</option>
            <option>Francés</option>
          </select>
        </div>
      </div>

      {/* Datos empresa */}
      <h2 className="text-lg font-medium mt-6">Datos de la Empresa</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Razón Social</label>
          <input
            type="text"
            value={perfil.nombre_empresa || ''}
            onChange={(e) => handleChange('nombre_empresa', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">NIF / CIF</label>
          <input
            type="text"
            value={perfil.nif || ''}
            onChange={(e) => handleChange('nif', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Dirección</label>
          <input
            type="text"
            value={perfil.direccion || ''}
            onChange={(e) => handleChange('direccion', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ciudad</label>
          <input
            type="text"
            value={perfil.ciudad || ''}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Provincia</label>
          <input
            type="text"
            value={perfil.provincia || ''}
            onChange={(e) => handleChange('provincia', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">C.P.</label>
          <input
            type="text"
            value={perfil.cp || ''}
            onChange={(e) => handleChange('cp', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">País</label>
          <input
            type="text"
            value={perfil.pais || ''}
            onChange={(e) => handleChange('pais', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Email Empresa</label>
          <input
            type="email"
            value={perfil.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Web</label>
          <input
            type="url"
            value={perfil.web || ''}
            onChange={(e) => handleChange('web', e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Firma electrónica */}
      <h2 className="text-lg font-medium mt-6">Firma Electrónica</h2>
      <div className="flex items-center gap-4">
        {perfil.firma ? (
          <img src={perfil.firma} alt="Firma" className="h-24 object-contain border" />
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

      {/* Botón Guardar */}
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
