"use client";

import { useEffect, useState } from "react";

interface Opex {
  id: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export default function OpexPage() {
  const [opexList, setOpexList] = useState<Opex[]>([]);
  const [form, setForm] = useState({
    categoria: "",
    descripcion: "",
    monto: 0,
    fecha: "",
  });

  useEffect(() => {
    fetch("/api/opex")
      .then((res) => res.json())
      .then((data) => setOpexList(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/opex", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newOpex = await res.json();
    setOpexList((prev) => [...prev, ...newOpex]);
    setForm({ categoria: "", descripcion: "", monto: 0, fecha: "" });
  };

  const totalGastos = opexList.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gastos OPEX</h1>

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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Registrar gasto
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-2">Total OPEX: {totalGastos.toFixed(2)} €</h2>

      <table className="min-w-full b
