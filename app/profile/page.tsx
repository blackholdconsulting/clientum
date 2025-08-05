'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useSupabaseClient,
  useSession,
} from '@supabase/auth-helpers-react';

type Perfil = {
  id: string;
  user_id: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  idioma: string;
  email: string;
  firma: string | null;
};

export default function ProfilePage() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [firmaFile, setFirmaFile] = useState<File | null>(null);

  // 1) Redirigir si no hay sesión
  useEffect(() => {
    if (session === null) {
      router.replace('/login');
    }
  }, [session, router]);

  // 2) Cargar perfil
  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<'perfil', Perfil>('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        alert('Error cargando perfil: ' + error.message);
      }
      if (data) {
        setPerfil(data);
        setNombre(data.nombre);
        setApellidos(data.apellidos);
        setTelefono(data.telefono);
        setIdioma(data.idioma);
      }
      setLoading(false);
    })();
  }, [session, supabase]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);

    let firmaPath = perfil?.firma || null;

    // 3) Subir nueva firma si la hay
    if (firmaFile) {
      const fileName = `${session.user.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from('firmas')
        .upload(fileName, firmaFile, { contentType: firmaFile.type });
      if (uploadError) {
        alert('Error subiendo firma: ' + uploadError.message);
        setSaving(false);
        return;
      }
      firmaPath = fileName;
    }

    // 4) Upsert perfil
    const { error: upsertError } = await supabase
      .from<'perfil', Perfil>('perfil')
      .upsert(
        {
          user_id: session.user.id,
          nombre,
          apellidos,
          telefono,
          idioma,
          firma: firmaPath,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      alert('Error guardando perfil: ' + upsertError.message);
      setSaving(false);
      return;
    }

    // 5) Recargar datos
    const { data: refreshed } = await supabase
      .from<'perfil', Perfil>('perfil')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    if (refreshed) {
      setPerfil(refreshed);
    }

    setSaving(false);
    alert('Perfil guardado');
  };

  if (loading) {
    return <div className="p-8">Cargando perfil…</div>;
  }

  const firmaUrl =
    perfil?.firma
      ? supabase
          .storage
          .from('firmas')
          .getPublicUrl(perfil.firma).data.publicUrl
      : null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Apellidos */}
        <div>
          <label className="block mb-1">Apellidos</label>
          <input
            type="text"
            value={apellidos}
            onChange={e => setApellidos(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block mb-1">Teléfono</label>
          <input
            type="text"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Idioma */}
        <div>
          <label className="block mb-1">Idioma</label>
          <select
            value={idioma}
            onChange={e => setIdioma(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email (no editable)</label>
          <input
            type="email"
            value={session.user.email || ''}
            disabled
            className="w-full bg-gray-100 border px-3 py-2 rounded"
          />
        </div>

        {/* Firma digital */}
        <div>
          <label className="block mb-1">Firma Digital</label>
          <div className="flex items-center space-x-4">
            <div className="w-40 h-24 border bg-gray-50 flex items-center justify-center">
              {firmaUrl ? (
                <img
                  src={firmaUrl}
                  alt="firma"
                  className="max-w-full max-h-full"
                />
              ) : (
                <span className="text-gray-500">Sin firma</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={e =>
                setFirmaFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </div>
    </div>
  );
}
