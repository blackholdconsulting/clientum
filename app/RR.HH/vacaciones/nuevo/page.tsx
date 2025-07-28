// app/RR.HH/vacaciones/nuevo/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../../../../lib/database.types";

export default function NewVacacionPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const [form, setForm] = useState({
    empleado_id: "",
    start_date: "",
    end_date: "",
    tipo: "vacaciones",
    motivo: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const { error } = await supabase
      .from("vacaciones")
      .insert([{
        empleado_id: form.empleado_id,
        start_date: form.start_date,
        end_date: form.end_date,
        tipo: form.tipo,
        motivo: form.motivo || null,
      }]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/RR.HH/vacaciones");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solicitar vacaciones</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}

        <div>
          <label className="block text-sm font-medium">Empleado (ID)</label>
          <input
            name="empleado_id"
            value={form.empleado_id}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Fecha inicio</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha fin</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="vacaciones">Vacaciones</option>
            <option value="asuntos_propios">Asuntos propios</option>
            <option value="baja">Baja médica</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Motivo</label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows={3}
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
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Solicitando..." : "Solicitar vacaciones"}
          </button>
        </div>
      </form>
    </div>
  );
}
