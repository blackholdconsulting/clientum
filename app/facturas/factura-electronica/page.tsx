"use client";
import { useState, useEffect } from "react";

export default function FacturasElectronicasPage() {
  const [facturas, setFacturas] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/facturas")
      .then(res => res.json())
      .then(data => setFacturas(data.facturas || []));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas Electrónicas</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Número</th>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Cliente</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">CSV</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => (
            <tr key={f.id}>
              <td className="border p-2">{f.numero}</td>
              <td className="border p-2">{new Date(f.fecha).toLocaleDateString()}</td>
              <td className="border p-2">{f.cliente}</td>
              <td className="border p-2">{f.estado}</td>
              <td className="border p-2">{f.csv}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
