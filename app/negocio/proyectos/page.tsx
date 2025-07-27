"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { supabase } from "@/lib/supabase"; // ajusta la ruta según tu proyecto

interface Proyecto {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function ProyectosPage() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // 🏃‍♂️ Carga inicial de proyectos
  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) return console.error(error);
        setProjects(data || []);
      });
  }, []);

  // 📬 Handler de creación
  const handleCreate = async () => {
    if (!name) return alert("El nombre es obligatorio");
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, description })
      .select()
      .single();
    if (error) {
      console.error(error);
      return alert("Error creando proyecto");
    }
    setProjects((prev) => [data, ...prev]);
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Proyectos</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Crear proyecto
        </button>
      </header>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500">No tienes proyectos creados.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.id} className="border-b pb-2">
              <h2 className="font-medium">{p.name}</h2>
              <p className="text-sm text-gray-600">{p.description}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold mb-4">
                    Nuevo proyecto
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Nombre</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full border rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Descripción</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 w-full border rounded-md p-2"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </main>
  );
}
