// app/presupuestos/nuevo/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Form {
  cliente: string;
  fecha: string;
  concepto: string;
  importe: number;
}

export default function NewPresupuestoPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>({
    cliente: "",
    fecha: "",
    concepto: "",
    importe: 0,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === "importe" ? Number(value) : value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: enviar a tu API o supabase
    console.log("Guardando presupuesto:", form);
    router.push("/presupuestos");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear presupuesto</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <input
            name="cliente"
            value={form.cliente}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Concepto
          </label>
          <textarea
            name="concepto"
            value={form.concepto}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Importe
          </label>
          <input
            type="number"
            name="importe"
            value={form.importe}
            onChange={handleChange}
            step="0.01"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
