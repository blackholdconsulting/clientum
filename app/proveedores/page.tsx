"use client";

import { useEffect, useState } from "react";

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
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
  });

  useEffect(() => {
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then((data) => setProveedores(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/proveedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newProv = await res.json();
    setProveedores((prev) => [...newProv, ...prev]);
    setForm({ nombre: "", email: "", telefono: "", direccion: "", notas: "" });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Proveedores</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nombre"
          className="p-2 border rounded"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Teléfono"
          className="p-2 border rounded"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        />
        <input
          type="text"
          placeholder="Dirección"
          className="p-2 border rounded"
          value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        />
        <textarea
          placeholder="Notas"
          className="p-2 border rounded md:col-span-2"
          value={form.notas}
          onChange={(e) => setForm({ ...form, notas: e.target.value })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 md:col-span-2"
        >
          Añadir Proveedor
        </button>
      </form>

      {/* Listado */}
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Teléfono</th>
            <th className="py-2 px-4 text-left">Dirección</th>
            <th className="py-2 px-4 text-left">Notas</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((prov) => (
            <tr key={prov.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{prov.nombre}</td>
              <td className="py-2 px-4">{prov.email}</td>
              <td className="py-2 px-4">{prov.telefono}</td>
              <td className="py-2 px-4">{prov.direccion}</td>
              <td className="py-2 px-4">{prov.notas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
