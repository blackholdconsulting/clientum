// app/RR.HH/horarios/nuevo/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../../../../lib/database.types";

// Ajuste: tabla en plural "registro_horarios"
type RegistroHorario = Database["public"]["Tables"]["registro_horarios"]["Row"];

export default function NewHorarioPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const [form, setForm] = useState<Partial<RegistroHorario>>({
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    empleado_id: "",
    notas: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("registro_horarios")      // plural
      .insert([
        {
          fecha: form.fecha!,
          hora_inicio: form.hora_inicio!,
          hora_fin: form.hora_fin!,
          empleado_id: form.empleado_id!,
          notas: form.notas || null,
        },
      ]);
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/RR.HH/horarios");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear horario</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        {errorMsg && (
          <div className="text-red-600 text-sm">{errorMsg}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora inicio
            </label>
            <input
              type="time"
              name="hora_inicio"
              value={form.hora_inicio || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora fin
            </label>
            <input
              type="time"
              name="hora_fin"
              value={form.hora_fin || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Empleado
          </label>
          <input
            type="text"
            name="empleado_id"
            value={form.empleado_id || ""}
            onChange={handleChange}
            placeholder="ID o selección de empleado"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notas
          </label>
          <textarea
            name="notas"
            value={form.notas || ""}
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
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
