// app/profile/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/auth-helpers-nextjs';

export type Perfil = {
  id: string;
  user_id: string;
  nombre: string | null;
  apellidos: string | null;
  telefono: string | null;
  idioma: string | null;
  email: string;
  firma: string | null;
};

export default function ProfilePage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);

  // 1) Recuperar sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth/login?callbackUrl=/profile');
      } else {
        setSession(session);
      }
    });
  }, [supabase, router]);

  // 2) Cargar datos de perfil
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    supabase
      .from('perfil')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data, error }) => {
        setLoading(false);
        if (error && error.code !== 'PGRST116') {
          alert('Error cargando perfil: ' + error.message);
        }
        if (data) {
          setPerfil(data);
          setNombre(data.nombre ?? '');
          setApellidos(data.apellidos ?? '');
          setTelefono(data.telefono ?? '');
          setIdioma(data.idioma ?? 'Español');
          if (data.firma) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('firmas').getPublicUrl(data.firma);
            setFirmaUrl(publicUrl);
          }
        }
      });
  }, [session, supabase]);

  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFirmaFile(e.target.files[0]);
    }
  };

  // 3) Guardar/upsert perfil
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);

    let firmaKey: string | null = perfil?.firma ?? null;
    if (firmaFile) {
      const fileName = `firma_${session.user.id}_${Date.now()}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('firmas')
        .upload(fileName, firmaFile, { upsert: true });
      if (uploadError) {
        alert('Error subiendo firma: ' + uploadError.message);
        setSaving(false);
        return;
      }
      firmaKey = uploadData.path;
    }

    const { error: upsertError } = await supabase
      .from('perfil')
      .upsert(
        {
          user_id: session.user.id,
          nombre,
          apellidos,
          telefono,
          idioma,
          firma: firmaKey,
        },
        { onConflict: 'user_id' }
      );
    if (upsertError) {
      alert('Error guardando perfil: ' + upsertError.message);
      setSaving(false);
      return;
    }

    // refrescar datos
    const { data: refreshed, error: refError } = await supabase
      .from('perfil')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    if (refreshed) {
      setPerfil(refreshed);
      if (refreshed.firma) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('firmas').getPublicUrl(refreshed.firma);
        setFirmaUrl(publicUrl);
      }
    }
    if (refError) {
      console.error('Error refrescando perfil:', refError.message);
    }

    setSaving(false);
    alert('Perfil guardado correctamente');
  };

  if (loading) {
    return <p className="p-6">Cargando perfil…</p>;
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Idioma</label>
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            className="w-full border px-2 py-1 rounded"
          >
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </div>
        <div>
          <label>Email (no editable)</label>
          <input
            type="text"
            value={session?.user.email ?? ''}
            disabled
            className="w-full bg-gray-100 px-2 py-1 rounded"
          />
        </div>
        <div>
          <label>Firma Digital</label>
          <div className="flex items-center space-x-4">
            <div className="w-40 h-24 border bg-gray-50 flex items-center justify-center">
              {firmaUrl ? (
                <img src={firmaUrl} alt="firma" className="max-h-full" />
              ) : (
                <span>Sin firma</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleChangeFile} />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </form>
    </main>
  );
}
