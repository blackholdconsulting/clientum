"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoActivoPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    grupo: "",
    valor: "",
    amortizacion: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contabilidad/activos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          codigo: form.codigo,
          grupo: form.grupo,
          valor: parseFloat(form.valor),
          amortizacion: parseFloat(form.amortizacion),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        console.error("API error:", data.error);
        alert("Error guardando activo: " + data.error);
        return;
      }
      router.push("/contabilidad/activos");
    } catch (err: any) {
      console.error("Fetch failed:", err);
      alert("Error de red o inesperado: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/contabilidad/activos"
          className="text-blue-600 hover:underline"
        >
          ← Volver a Activos
        </Link>
        <h1 className="text-2xl font-semibold ml-4">Nuevo activo</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded shadow max-w-xl"
      >
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Ej. Equipo informático"
            required
          />
        </div>

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código
          </label>
          <input
            type="text"
            name="codigo"
            value={form.codigo}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Ej. ACT-001"
            required
          />
        </div>

        {/* Grupo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Grupo
          </label>
          <input
            type="text"
            name="grupo"
            value={form.grupo}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Ej. Inmovilizado material"
            required
          />
        </div>

        {/* Valor y Amortización */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor (€)
            </label>
            <input
              type="number"
              name="valor"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amortización anual (€)
            </label>
            <input
              type="number"
              name="amortizacion"
              min="0"
              step="0.01"
              value={form.amortizacion}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar activo"}
          </button>
        </div>
      </form>
    </div>
  );
}
