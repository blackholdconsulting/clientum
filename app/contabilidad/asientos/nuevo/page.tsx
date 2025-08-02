"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NuevoAsiento() {
  const router = useRouter();
  const [factura, setFactura] = useState("");
  const [fecha, setFecha] = useState("");
  const [cuentaId, setCuentaId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [debe, setDebe] = useState(0);
  const [haber, setHaber] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/contabilidad/asientos", {
      method: "POST",
      body: JSON.stringify({ factura, fecha, cuenta_id: cuentaId, descripcion, debe, haber }),
      headers: { "Content-Type": "application/json" },
    });
    router.push("/contabilidad/asientos");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Nuevo Asiento</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label>Factura</label>
          <input value={factura} onChange={e => setFactura(e.target.value)} className="w-full border p-2" />
        </div>
        <div>
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full border p-2" />
        </div>
        <div>
          <label>Cuenta</label>
          <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} className="w-full border p-2">
            <option value="">– elige cuenta –</option>
            {/* Aquí deberías mapear tus cuentas traídas de /api/contabilidad/cuentas */}
          </select>
        </div>
        <div>
          <label>Descripción</label>
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full border p-2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label>Debe</label>
            <input type="number" value={debe} onChange={e => setDebe(+e.target.value)} className="w-full border p-2" />
          </div>
          <div>
            <label>Haber</label>
            <input type="number" value={haber} onChange={e => setHaber(+e.target.value)} className="w-full border p-2" />
          </div>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </form>
    </div>
  );
}
