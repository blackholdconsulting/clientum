"use client";

import { useState, useEffect } from "react";

export default function FacturasElectronicasPage() {
  const [facturas, setFacturas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/facturas")
      .then(res => res.json())
      .then(data => setFacturas(data.facturas));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas Electrónicas</h1>
      <a
        href="/facturas/factura-electronica/nueva"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Crear nueva factura electrónica
      </a>

      <table className="w-full mt-6 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Número</th>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Cliente</th>
            <th className="border p-2">Estado AEAT</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f, i) => (
            <tr key={i}>
              <td className="border p-2">{f.numero}</td>
              <td className="border p-2">{new Date(f.fecha).toLocaleDateString()}</td>
              <td className="border p-2">{f.cliente}</td>
              <td className="border p-2">{f.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
