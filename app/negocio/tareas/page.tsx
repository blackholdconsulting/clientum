"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
}

export default function TareasPage() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      dueDate,
    };
    setTasks((prev) => [newTask, ...prev]);
    // reset
    setTitle("");
    setDescription("");
    setDueDate(format(new Date(), "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mis tareas</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <FiPlus className="mr-2" />
          Crear tarea
        </button>
      </header>

      {/* Contenido: lista o estado vacío */}
      {tasks.length > 0 ? (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 text-left">Título</th>
              <th className="py-2 text-left">Descripción</th>
              <th className="py-2 text-left">Vence</th>
              <th className="py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{t.title}</td>
                <td className="py-2">{t.description || "–"}</td>
                <td className="py-2">{format(new Date(t.dueDate), "dd/MM/yyyy")}</td>
                <td className="py-2 text-center">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <section className="text-center py-20 text-gray-600 space-y-4">
          <img src="/images/empty-tasks.svg" alt="Sin tareas" className="mx-auto h-24" />
          <p>No tienes tareas asignadas.</p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Crear tarea
          </button>
        </section>
      )}

      {/* Modal de “Crear tarea” */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold mb-4">
                    Nueva tarea
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Título</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full border rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha de vencimiento</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="w-full border rounded p-2"
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Guardar tarea
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </main>
  );
}

