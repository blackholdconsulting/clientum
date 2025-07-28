// app/RR.HH/horarios/nuevo/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../../../../lib/database.types";

type RegistroHorario = Database["public"]["Tables"]["registro_horario"]["Row"];

export default function NewHorarioPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const [form, setForm] = useState<Partial<RegistroHorario>>({
    fecha: "",
    hora_entrada: "",
    hora_salida: "",
    empleado_id: "",
  });
  const [notas, setNotas] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNotas = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotas(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("registro_horario")
      .insert([
        {
          fecha: form.fecha!,
          hora_entrada: form.hora_entrada!,
          hora_salida: form.hora_salida!,
          empleado_id: form.empleado_id!,
          notas: notas || null,
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
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear horario</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}

        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={form.fecha || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Hora entrada</label>
            <input
              type="time"
              name="hora_entrada"
              value={form.hora_entrada || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Hora salida</label>
            <input
              type="time"
              name="hora_salida"
              value={form.hora_salida || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Empleado (ID)</label>
          <input
            type="text"
            name="empleado_id"
            value={form.empleado_id || ""}
            onChange={handleChange}
            placeholder="UUID empleado"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Notas</label>
          <textarea
            value={notas}
            onChange={handleNotas}
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
