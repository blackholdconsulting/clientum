"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Proveedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  notas: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filtered, setFiltered] = useState<Proveedor[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const loadProveedores = () => {
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then((data) => {
        setProveedores(data);
        setFiltered(data);
      });
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    setFiltered(
      proveedores.filter(
        (p) =>
          p.nombre.toLowerCase().includes(value.toLowerCase()) ||
          (p.email && p.email.toLowerCase().includes(value.toLowerCase())) ||
          (p.telefono && p.telefono.includes(value))
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const payload = editMode ? { id: editId, ...form } : form;

    await fetch("/api/proveedores", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setForm({ nombre: "", email: "", telefono: "", direccion: "", notas: "" });
    setEditMode(false);
    setShowModal(false);
    loadProveedores();
  };

  const handleEdit = (prov: Proveedor) => {
    setForm({
      nombre: prov.nombre,
      email: prov.email,
      telefono: prov.telefono,
      direccion: prov.direccion,
      notas: prov.notas,
    });
    setEditId(prov.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este proveedor?")) return;
    await fetch("/api/proveedores", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadProveedores();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar proveedor..."
        className="mb-4 w-full p-2 border rounded"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Tabla de proveedores */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 border-b text-sm">
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Teléfono</th>
              <th className="py-3 px-4 text-left">Dirección</th>
              <th className="py-3 px-4 text-left">Notas</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prov) => (
              <tr key={prov.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{prov.nombre}</td>
                <td className="py-2 px-4">{prov.email}</td>
                <td className="py-2 px-4">{prov.telefono}</td>
                <td className="py-2 px-4">{prov.direccion}</td>
                <td className="py-2 px-4">{prov.notas}</td>
                <td className="py-2 px-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(prov)}
                    className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prov.id)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nombre" className="p-2 border rounded" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              <input type="email" placeholder="Email" className="p-2 border rounded" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input type="text" placeholder="Teléfono" className="p-2 border rounded" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <input type="text" placeholder="Dirección" className="p-2 border rounded" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              <textarea placeholder="Notas" className="p-2 border rounded md:col-span-2" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={() => { setShowModal(false); setEditMode(false); }} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {editMode ? "Guardar Cambios" : "Añadir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
