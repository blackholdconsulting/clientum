"use client";

import { useState, useEffect } from "react";

export default function FacturasElectronicasPage() {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await fetch("/api/facturas");
        const data = await res.json();
        if (data.success) {
          setFacturas(data.facturas);
        }
      } catch (error) {
        console.error("Error cargando facturas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Facturas Electrónicas</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : facturas.length === 0 ? (
        <p>No hay facturas enviadas todavía.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Número</th>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Cliente</th>
              <th className="border p-2">Estado AEAT</th>
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
                <td className="border p-2">{f.csv || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
