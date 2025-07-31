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

  // Carga servicios del usuario
  const load = async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("id,nombre,precio");
    if (error) console.error(error);
    else setServicios(data as Servicio[]);
  };

  useEffect(() => {
    load();
  }, []);

  // Añadir nuevo servicio
  const addServicio = async () => {
    if (!nombre || precio <= 0) return alert("Nombre y precio válidos");
    setLoading(true);
    const { error } = await supabase
      .from("servicios")
      .insert({ nombre, precio });
    if (error) console.error(error);
    else {
      setNombre("");
      setPrecio(0);
      load();
    }
    setLoading(false);
  };

  // Borrar servicio
  const delServicio = async (id: string) => {
    await supabase.from("servicios").delete().eq("id", id);
    load();
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Configurar Servicios</h1>

      {/* Formulario añadir */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <input
          className="border rounded px-2 py-1 col-span-2"
          placeholder="Nombre servicio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Precio"
          type="number"
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(+e.target.value)}
        />
        <button
          className="col-span-3 bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          onClick={addServicio}
          disabled={loading}
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
              className="text-red-600 hover:underline"
              onClick={() => delServicio(s.id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
