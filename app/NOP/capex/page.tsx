"use client";

import { useEffect, useState } from "react";

interface Capex {
  id: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export default function CapexPage() {
  const [capexList, setCapexList] = useState<Capex[]>([]);
  const [form, setForm] = useState({
    categoria: "",
    descripcion: "",
    monto: 0,
    fecha: "",
  });

  useEffect(() => {
    fetch("/api/capex")
      .then((res) => res.json())
      .then((data) => setCapexList(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/capex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newCapex = await res.json();
    setCapexList((prev) => [...prev, ...newCapex]);
    setForm({ categoria: "", descripcion: "", monto: 0, fecha: "" });
  };

  const totalCapex = capexList.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gastos CAPEX</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Categoría"
          className="w-full p-2 border rounded"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          required
        />
        <textarea
          placeholder="Descripción"
          className="w-full p-2 border rounded"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <input
          type="number"
          placeholder="Monto (€)"
          className="w-full p-2 border rounded"
          value={form.monto}
          onChange={(e) =>
            setForm({ ...form, monto: parseFloat(e.target.value) })
          }
          required
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Registrar inversión
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Total CAPEX: {totalCapex.toFixed(2)} €</h2>

      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-2 px-4 text-left">Categoría</th>
            <th className="py-2 px-4 text-left">Descripción</th>
            <th className="py-2 px-4 text-left">Monto (€)</th>
            <th className="py-2 px-4 text-left">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {capexList.map((inv) => (
            <tr key={inv.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{inv.categoria}</td>
              <td className="py-2 px-4">{inv.descripcion}</td>
              <td className="py-2 px-4">{inv.monto}</td>
              <td className="py-2 px-4">{inv.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
