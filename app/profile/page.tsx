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
  firma?: string; // URL pública
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
    const load = async () => {
      // 1) Sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login?callbackUrl=/profile');
        return;
      }

      // 2) GET perfil
      const res = await fetch('/api/usuario/perfil');
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
      } else if (json.perfil) {
        setPerfil(json.perfil);
      }

      // 3) Si hay firma guardada en storage, carga su URL pública
      if (json.perfil?.firma) {
        const { data } = supabase.storage
          .from('firmas')
          .getPublicUrl(json.perfil.firma);
        setPerfil((p) => ({ ...p, firma: data.publicUrl }));
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
    setError(null);

    // 1) Sesión
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError('No estás autenticado');
      setUploadingFirma(false);
      return;
    }

    // 2) Subida al bucket "firmas"
    const filename = `${session.user.id}/firma-${Date.now()}.png`;
    const { error: uploadErr } = await supabase.storage
      .from('firmas')
      .upload(filename, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploadingFirma(false);
      return;
    }

    // 3) Obtén URL pública y actualiza estado & base de datos
    const {
      data: { publicUrl },
    } = supabase.storage.from('firmas').getPublicUrl(filename);
    setPerfil((p) => ({ ...p, firma: filename }));
    handleChange('firma', filename);

    // Opcional: guarda inmediatamente el perfil con la nueva firma
    await handleSave();

    // Finalmente, carga la URL pública para mostrarla
    setPerfil((p) => ({ ...p, firma: publicUrl }));
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

      {/* Formulario resumido (campos previos ...) */}
      {/* Datos personales, empresa, etc. */}

      {/* Firma electrónica */}
      <div>
        <h2 className="text-lg font-medium mb-2">Firma Electrónica</h2>
        <div className="flex items-center gap-4">
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

      {/* Botón Guardar (para resto del perfil) */}
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
