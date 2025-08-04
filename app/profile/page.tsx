// app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  firma?: string;
}

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();
  const path = usePathname();

  const [sessionChecked, setSessionChecked] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>({ idioma: 'Español' });
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingFirma, setUploadingFirma] = useState(false);

  // 1) Comprueba sesión UNA SOLA VEZ
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Solo redirige si no estás ya en login
        if (path !== '/auth/login') {
          router.replace(`/auth/login?callbackUrl=${encodeURIComponent('/profile')}`);
        }
      } else {
        // Si hay sesión, procedemos a cargar perfil
        setSessionChecked(true);
      }
    })();
  }, [router, supabase, path]);

  // 2) Cuando sepamos que hay sesión, carga el perfil
  useEffect(() => {
    if (!sessionChecked) return;
    (async () => {
      setLoadingPerfil(true);
      const res = await fetch('/api/usuario/perfil');
      const json = await res.json();
      if (json.success) {
        if (json.perfil) {
          const p: Perfil = json.perfil;
          if (p.firma) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('firmas').getPublicUrl(p.firma);
            p.firma = publicUrl;
          }
          setPerfil(p);
        } else {
          // inicializa email
          const { data: { session } } = await supabase.auth.getSession();
          setPerfil({ ...perfil, email: session?.user.email || '', idioma: 'Español' });
        }
      } else {
        setError(json.error);
      }
      setLoadingPerfil(false);
    })();
  }, [sessionChecked]);

  const handleChange = (field: keyof Perfil, value: string) =>
    setPerfil((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/usuario/perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil),
    });
    const json = await res.json();
    if (json.success) {
      setSuccess(true);
    } else {
      setError(json.error);
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

    const pathKey = `${session.user.id}/firma.png`;
    const { error: uploadErr } = await supabase.storage
      .from('firmas')
      .upload(pathKey, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from('firmas').getPublicUrl(pathKey);
      setPerfil((p) => ({ ...p, firma: publicUrl }));
    }
    setUploadingFirma(false);
  };

  if (!sessionChecked || loadingPerfil) {
    return <div className="p-6">Cargando perfil…</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>
      {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-600 bg-green-100 p-2 rounded">Perfil guardado ✔️</div>}

      {/* Aquí van todos tus campos como antes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ... */}
      </div>

      {/* Firma */}
      <div>
        {/* ... */}
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
