// app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, ChangeEvent } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Perfil { /* igual que antes */ }

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil>({ idioma: 'Español' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingFirma, setUploadingFirma] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login?callbackUrl=/profile');
        return;
      }

      const res = await fetch('/api/usuario/perfil');
      const json = await res.json();
      if (json.success) {
        if (json.perfil) {
          const p: Perfil = json.perfil;
          if (p.firma) {
            const { data: { publicUrl } } = supabase.storage
              .from('firmas')
              .getPublicUrl(p.firma);
            p.firma = publicUrl;
          }
          setPerfil(p);
        } else {
          setPerfil(p => ({ ...p, email: session.user.email || '' }));
        }
      } else {
        setError(json.error);
      }
      setLoading(false);
    })();
  }, [router, supabase]);

  const handleChange = (field: keyof Perfil, value: string) =>
    setPerfil(p => ({ ...p, [field]: value }));

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
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) {
      setError('No estás autenticado');
      setUploadingFirma(false);
      return;
    }

    const path = `${session.user.id}/firma.png`;
    const { error: uploadErr } = await supabase.storage
      .from('firmas')
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
    } else {
      const { data: { publicUrl } } = supabase
        .storage.from('firmas')
        .getPublicUrl(path);
      setPerfil(p => ({ ...p, firma: publicUrl }));
    }
    setUploadingFirma(false);
  };

  if (loading) return <div className="p-6">Cargando perfil…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>
      {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-600 bg-green-100 p-2 rounded">Perfil guardado ✔️</div>}

      {/* ... aquí tu JSX con todos los campos ... */}

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
