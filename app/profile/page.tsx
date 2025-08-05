// app/profile/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

type Perfil = {
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
  const supabase = useSupabaseClient();
  const session = useSession();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [firmaFile, setFirmaFile] = useState<File | null>(null);

  // Carga el perfil una sola vez
  useEffect(() => {
    if (!session) return; // espera que middleware haya validado
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (!error && data) {
        setPerfil(data);
        setNombre(data.nombre ?? '');
        setApellidos(data.apellidos ?? '');
        setTelefono(data.telefono ?? '');
        setIdioma(data.idioma ?? 'Español');
      }
      setLoading(false);
    })();
  }, [session, supabase]);

  if (loading) {
    return <p className="p-6">Cargando perfil…</p>;
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);

    let firmaPath = perfil?.firma ?? null;
    if (firmaFile) {
      const { data: up, error: upErr } = await supabase.storage
        .from('firmas')
        .upload(
          `firmas/${session.user.id}-${Date.now()}.png`,
          firmaFile,
          { upsert: true }
        );
      if (!upErr && up) {
        firmaPath = up.path;
      }
    }

    const { error } = await supabase
      .from('perfil')
      .upsert({
        user_id: session.user.id,
        nombre,
        apellidos,
        telefono,
        idioma,
        firma: firmaPath,
      });

    setSaving(false);
    if (error) {
      alert('Error guardando perfil: ' + error.message);
    } else {
      alert('Perfil guardado correctamente');
      setPerfil((p) =>
        p
          ? { ...p, nombre, apellidos, telefono, idioma, firma: firmaPath }
          : p
      );
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Mi perfil</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <label className="block">
          Nombre
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Apellidos
          <input
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Teléfono
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Idioma
          <select
            value={idioma}
            onChange={(e) => setIdioma(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            <option>Español</option>
            <option>Inglés</option>
          </select>
        </label>
        <label className="block">
          Email (no editable)
          <input
            readOnly
            value={perfil?.email || ''}
            className="w-full bg-gray-100 border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Firma Digital
          <div className="flex items-center space-x-4 mt-1">
            <div className="w-32 h-24 border flex items-center justify-center text-gray-500">
              {perfil?.firma ? (
                <img
                  src={
                    supabase.storage
                      .from('firmas')
                      .getPublicUrl(perfil.firma)
                      .data.publicUrl
                  }
                  alt="firma"
                />
              ) : (
                'Sin firma'
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFirmaFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 rounded text-white ${
            saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </button>
      </form>
    </main>
  );
}
