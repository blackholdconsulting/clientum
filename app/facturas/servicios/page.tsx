// File: /app/facturas/servicios/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [loading, setLoading] = useState(false);

  // Carga los servicios del usuario
  const load = async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("id,nombre,precio");
    if (error) console.error("Load servicios:", error.message);
    else setServicios(data as Servicio[]);
  };

  useEffect(() => {
    load();
  }, []);

  // Añade un servicio, incluyendo user_id
  const addServicio = async () => {
    if (!nombre.trim() || precio <= 0) {
      return alert("Debes indicar un nombre y un precio mayor que 0");
    }
    setLoading(true);

    // 1) Obtén el user_id actual
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      alert("No se pudo identificar al usuario.");
      setLoading(false);
      return;
    }

    // 2) Inserta con user_id
    const { error: insertErr } = await supabase
      .from("servicios")
      .insert([
        {
          user_id: user.id,
          nombre,
          precio,
        },
      ]);
    if (insertErr) {
      console.error("Insert servicio:", insertErr.message);
      alert("Error al guardar servicio: " + insertErr.message);
    } else {
      // reset y recarga
      setNombre("");
      setPrecio(0);
      await load();
    }

    setLoading(false);
  };

  // Borra un servicio
  const delServicio = async (id: string) => {
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (error) console.error("Delete servicio:", error.message);
    else load();
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configurar Servicios</h1>

      {/* Formulario añadir */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <input
          type="text"
          placeholder="Nombre servicio"
          className="border rounded px-2 py-1 col-span-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          step="0.01"
          className="border rounded px-2 py-1"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
        />
        <button
          onClick={addServicio}
          disabled={loading}
          className="col-span-3 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          {loading ? "Añadiendo…" : "Añadir servicio"}
        </button>
      </div>

      {/* Lista de servicios */}
      <ul className="space-y-2">
        {servicios.map((s) => (
          <li
            key={s.id}
            className="flex justify-between items-center border-b py-2"
          >
            <span>
              {s.nombre} — €{s.precio.toFixed(2)}
            </span>
            <button
              onClick={() => delServicio(s.id)}
              className="text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
