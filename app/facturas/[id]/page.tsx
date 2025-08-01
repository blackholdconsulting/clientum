"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExportarPDFButton from "@/components/ExportarPDFButton";

export default function FacturaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [factura, setFactura] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchFactura = async () => {
      try {
        const res = await fetch(`/api/facturas/${id}`);
        const data = await res.json();
        if (data.success) {
          setFactura(data.factura);
        } else {
          alert("No se pudo cargar la factura: " + data.message);
        }
      } catch (error) {
        console.error("Error cargando factura:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id]);

  if (loading) return <p className="p-6">Cargando factura...</p>;
  if (!factura) return <p className="p-6">Factura no encontrada.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Detalle de Factura</h1>

      <div className="mb-6">
        <p><strong>Número:</strong> {factura.numero}</p>
        <p><strong>Fecha emisión:</strong> {factura.fecha_emisor}</p>
        <p><strong>Fecha vencimiento:</strong> {factura.fecha_vencim}</p>
        <p><strong>Cliente ID:</strong> {factura.cliente_id}</p>
        <p><strong>Concepto:</strong> {factura.concepto}</p>
        <p><strong>Total:</strong> {factura.total} €</p>
      </div>

      {/* Botón Exportar PDF */}
      <ExportarPDFButton factura={factura} />

      <button
        onClick={() => router.back()}
        className="mt-4 ml-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        ← Volver
      </button>
    </div>
  );
}
