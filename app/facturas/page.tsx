"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExportarPDFButton from "@/components/ExportarPDFButton";

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await fetch("/api/facturas"); // Endpoint para listar
        const data = await res.json();
        if (data.success) {
          setFacturas(data.facturas);
        } else {
          alert("Error al cargar facturas: " + data.message);
        }
      } catch (error) {
        console.error("Error al obtener facturas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pagada":
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Pagada</span>;
      case "enviada":
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Enviada</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Borrador</span>;
    }
  };

  if (loading) return <p className="p-6">Cargando facturas...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Histórico de Facturas</h1>
        <button
          onClick={() => router.push("/facturas/nueva")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nueva Factura
        </button>
      </header>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border-b">Número</th>
            <th className="p-3 border-b">Fecha</th>
            <th className="p-3 border-b">Cliente</th>
            <th className="p-3 border-b">Total</th>
            <th className="p-3 border-b">Estado</th>
            <th className="p-3 border-b text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((factura) => (
            <tr
              key={factura.id}
              className="hover:bg-gray-50 transition-all"
            >
              <td className="p-3 border-b">{factura.numero}</td>
              <td className="p-3 border-b">{factura.fecha_emisor}</td>
              <td className="p-3 border-b">{factura.receptor || factura.cliente_id}</td>
              <td className="p-3 border-b">{factura.total} €</td>
              <td className="p-3 border-b">{getEstadoBadge(factura.estado)}</td>
              <td className="p-3 border-b text-center space-x-2">
                <button
                  onClick={() => router.push(`/facturas/${factura.id}`)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                >
                  Ver
                </button>
                <ExportarPDFButton factura={factura} />
                <button
                  onClick={() => alert("Funcionalidad de reenviar próximamente")}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Reenviar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {facturas.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No hay facturas creadas.</p>
      )}
    </div>
  );
}
