// app/asientos/nuevo/page.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseServer";

export default function NuevoAsientoPage() {
  const router = useRouter();
  const [fecha, setFecha] = useState("");
  const [facturaId, setFacturaId] = useState("");
  const [cuentaId, setCuentaId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [debe, setDebe] = useState<number>(0);
  const [haber, setHaber] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { fecha, factura_id: facturaId, cuenta_id: cuentaId, descripcion, debe, haber };

    const res = await fetch("/api/asiento_contable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/contabilidad/asientos");
    } else {
      const err = await res.json();
      alert("Error: " + (err.message || JSON.stringify(err)));
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Nuevo Asiento Contable</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Fecha</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">Factura</label>
          <select
            required
            value={facturaId}
            onChange={e => setFacturaId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Selecciona factura --</option>
            {/* Aquí podrías mapear facturas si las cargas del servidor */}
          </select>
        </div>

        <div>
          <label className="block mb-1">Cuenta contable</label>
          <select
            required
            value={cuentaId}
            onChange={e => setCuentaId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Selecciona cuenta --</option>
            {/* Aquí mapearías tus cuentas */}
          </select>
        </div>

        <div>
          <label className="block mb-1">Descripción</label>
          <input
            type="text"
            required
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Debe</label>
            <input
              type="number"
              step="0.01"
              required
              value={debe}
              onChange={e => setDebe(parseFloat(e.target.value))}
              className="w-full border px-3 py-2 rounded text-right"
            />
          </div>
          <div>
            <label className="block mb-1">Haber</label>
            <input
              type="number"
              step="0.01"
              required
              value={haber}
              onChange={e => setHaber(parseFloat(e.target.value))}
              className="w-full border px-3 py-2 rounded text-right"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {loading ? "Guardando..." : "Guardar Asiento"}
        </button>
      </form>
    </div>
  );
}
