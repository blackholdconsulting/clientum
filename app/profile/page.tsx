'use client';

import { useState, useEffect, ChangeEvent, SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../../types/supabase';

export type Perfil = {
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
  const router = useRouter();
  const supabase = createPagesBrowserClient<Database>();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Carga inicial del perfil
  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // no autenticado
        return;
      }

      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // no existe perfil aún
        setPerfil(null);
      } else if (data) {
        setPerfil(data);
      }

      setLoading(false);
    }
    load();
  }, []);

  // Abrir modal y precargar formulario
  function openModal() {
    if (!perfil) return;
    setNombre(perfil.nombre);
    setApellidos(perfil.apellidos);
    setTelefono(perfil.telefono);
    setIdioma(perfil.idioma);
    setModalOpen(true);
  }

  // Cerrar modal y redirigir al dashboard
  function closeModalAndGoDashboard() {
    setModalOpen(false);
    router.push('/dashboard');
  }

  // Guardar cambios
  async function handleSave(e: SyntheticEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert('Sesión expirada');
      return;
    }

    // Si hay fichero de firma, súbelo primero
    let firmaPath: string | null = perfil?.firma ?? null;
    if (firmaFile) {
      const { data: up, error: errUp } = await supabase.storage
        .from('firmas')
        .upload(`${session.user.id}/${firmaFile.name}`, firmaFile, {
          upsert: true,
        });
      if (errUp) {
        console.error(errUp);
      } else {
        firmaPath = up.path;
      }
    }

    // Upsert del perfil
    const { error: upsertError } = await supabase
      .from('perfil')
      .upsert(
        {
          user_id: session.user.id,
          nombre,
          apellidos,
          telefono,
          idioma,
          email: session.user.email,
          firma: firmaPath,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      alert(`Error guardando perfil: ${upsertError.message}`);
    } else {
      // recarga datos UI opcional
      setPerfil({
        id: perfil?.id ?? '',
        user_id: session.user.id,
        nombre,
        apellidos,
        telefono,
        idioma,
        email: session.user.email!,
        firma: firmaPath,
      });
      // cierra modal y redirige
      closeModalAndGoDashboard();
    }

    setSaving(false);
  }

  if (loading) {
    return <p>Cargando perfil…</p>;
  }

  return (
    <>
      <h1>Mi perfil</h1>

      {modalOpen ? (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Editar perfil</h2>
            <form onSubmit={handleSave}>
              <label>
                Nombre
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </label>
              <label>
                Apellidos
                <input
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                />
              </label>
              <label>
                Teléfono
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </label>
              <label>
                Idioma
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                >
                  <option>Español</option>
                  <option>English</option>
                </select>
              </label>
              <label>
                Firma digital (PNG/PDF)
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFirmaFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar perfil'}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <p>
            Nombre: <strong>{perfil?.nombre}</strong>
          </p>
          <p>
            Apellidos: <strong>{perfil?.apellidos}</strong>
          </p>
          <p>
            Teléfono: <strong>{perfil?.telefono}</strong>
          </p>
          <p>
            Idioma: <strong>{perfil?.idioma}</strong>
          </p>
          <p>
            Email: <strong>{perfil?.email}</strong>
          </p>
          <p>
            Firma:{' '}
            <strong>{perfil?.firma ? perfil.firma.split('/').pop() : 'Sin firma'}</strong>
          </p>
          <button onClick={openModal}>Editar perfil</button>
        </div>
      )}
    </>
  );
}
