// app/profile/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, Transition } from '@headlessui/react';

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
  const supabase = createPagesBrowserClient();
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  // modal state & form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);

  // 1) Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth/login?callbackUrl=/profile');
      } else {
        setSession(session);
      }
    });
  }, [supabase, router]);

  // 2) Load perfil
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

  function openModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFirmaFile(e.target.files[0]);
    }
  }

  async function handleSave(e: FormEvent) {
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

    // refresh
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
    setSaving(false);
    closeModal();
  }

  if (loading) {
    return <p className="p-6">Cargando perfil…</p>;
  }

  return (
    <>
      <main className="p-8 max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p><strong>Nombre:</strong> {perfil?.nombre}</p>
        <p><strong>Apellidos:</strong> {perfil?.apellidos}</p>
        <p><strong>Teléfono:</strong> {perfil?.telefono}</p>
        <p><strong>Idioma:</strong> {perfil?.idioma}</p>
        <p><strong>Email:</strong> {session?.user.email}</p>
        <div>
          <strong>Firma:</strong>
          {firmaUrl ? (
            <img src={firmaUrl} alt="Firma" className="h-24 border mt-2" />
          ) : (
            <span className="block mt-2">Sin firma</span>
          )}
        </div>
        <button
          onClick={openModal}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Editar perfil
        </button>
      </main>

      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded bg-white p-6 align-middle shadow transition-all">
                  <Dialog.Title className="text-lg font-medium">
                    Editar perfil
                  </Dialog.Title>

                  <form onSubmit={handleSave} className="mt-4 space-y-4">
                    <label className="block">
                      Nombre
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full border p-2 rounded mt-1"
                        required
                      />
                    </label>

                    <label className="block">
                      Apellidos
                      <input
                        type="text"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        className="w-full border p-2 rounded mt-1"
                      />
                    </label>

                    <label className="block">
                      Teléfono
                      <input
                        type="text"
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
                      Firma digital
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full border p-2 rounded mt-1"
                      />
                    </label>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className={`px-4 py-2 rounded text-white ${
                          saving
                            ? 'bg-gray-400'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {saving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
