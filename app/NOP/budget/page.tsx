"use client";

import { useEffect, useState } from "react";

interface Budget {
  id: string;
  nombre: string;
  descripcion: string;
  monto: number;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "", monto: 0 });

  useEffect(() => {
    fetch("/api/budget")
      .then((res) => res.json())
      .then((data) => setBudgets(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newBudget = await res.json();
    setBudgets((prev) => [...prev, ...newBudget]);
    setForm({ nombre: "", descripcion: "", monto: 0 });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Budgets</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Nombre del Budget"
          className="w-full p-2 border rounded"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <textarea
          placeholder="Descripción"
          className="w-full p-2 border rounded"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        <input
          type="number"
          placeholder="Monto"
          className="w-full p-2 border rounded"
          value={form.monto}
          onChange={(e) =>
            setForm({ ...form, monto: parseFloat(e.target.value) })
          }
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Budget
        </button>
      </form>

      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="py-2 px-4 text-left">Nombre</th>
            <th className="py-2 px-4 text-left">Descripción</th>
            <th className="py-2 px-4 text-left">Monto (€)</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((b) => (
            <tr key={b.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{b.nombre}</td>
              <td className="py-2 px-4">{b.descripcion}</td>
              <td className="py-2 px-4">{b.monto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
