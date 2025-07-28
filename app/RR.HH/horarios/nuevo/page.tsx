"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Database } from "../../../../lib/database.types";

type JornadaInsert = {
  nombre: string;
  tipo: "continua" | "partida";
  turno1_inicio: string;
  turno1_fin: string;
  turno2_inicio?: string;
  turno2_fin?: string;
  dias_activos: { [dia: string]: boolean }; // e.g. { lunes: true, martes: true, ... }
};

export default function NewJornadaPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  const [form, setForm] = useState<JornadaInsert>({
    nombre: "",
    tipo: "continua",
    turno1_inicio: "",
    turno1_fin: "",
    turno2_inicio: "",
    turno2_fin: "",
    dias_activos: {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false,
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleField = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    if (name in form.dias_activos) {
      setForm(f => ({
        ...f,
        dias_activos: { ...f.dias_activos, [name]: checked }
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // 1) Insertar plantilla de jornada
    const { data: jornada, error: errJ } = await supabase
      .from("jornadas")
      .insert([{
        nombre: form.nombre,
        tipo: form.tipo,
        turno1_inicio: form.turno1_inicio,
        turno1_fin: form.turno1_fin,
        turno2_inicio: form.tipo === "partida" ? form.turno2_inicio : null,
        turno2_fin: form.tipo === "partida" ? form.turno2_fin : null,
        dias_activos: form.dias_activos,
      }])
      .select("id")
      .single();

    if (errJ) {
      setError(errJ.message);
      setSaving(false);
      return;
    }

    // 2) Generar calendario anual
    const year = new Date().getFullYear();
    const dates: { fecha: string; jornada_id: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, m, d);
        const dia = dt.toLocaleDateString("es-ES", { weekday: "long" });
        if ((form.dias_activos as any)[dia]) {
          dates.push({
            fecha: dt.toISOString().split("T")[0],
            jornada_id: jornada.id,
          });
        }
      }
    }

    // 3) Insertar registros de calendario
    const { error: errC } = await supabase
      .from("registro_horario")
      .insert(dates);
    if (errC) {
      setError(errC.message);
    } else {
      router.push("/RR.HH/jornadas");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva plantilla de jornada</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label className="block">Nombre de jornada</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleField}
            required
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block">Tipo de jornada</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleField}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="continua">Continua</option>
            <option value="partida">Partida</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Turno mañana inicio</label>
            <input
              name="turno1_inicio"
              type="time"
              value={form.turno1_inicio}
              onChange={handleField}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label>Turno mañana fin</label>
            <input
              name="turno1_fin"
              type="time"
              value={form.turno1_fin}
              onChange={handleField}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          {form.tipo === "partida" && (
            <>
              <div>
                <label>Turno tarde inicio</label>
                <input
                  name="turno2_inicio"
                  type="time"
                  value={form.turno2_inicio}
                  onChange={handleField}
                  required
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label>Turno tarde fin</label>
                <input
                  name="turno2_fin"
                  type="time"
                  value={form.turno2_fin}
                  onChange={handleField}
                  required
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>
            </>
          )}
        </div>

        <fieldset>
          <legend className="font-medium">Días activos</legend>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {Object.keys(form.dias_activos).map((dia) => (
              <label key={dia} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={dia}
                  checked={(form.dias_activos as any)[dia]}
                  onChange={handleField}
                />
                <span className="capitalize">{dia}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Generando..." : "Guardar plantilla"}
        </button>
      </form>
    </div>
  );
}
