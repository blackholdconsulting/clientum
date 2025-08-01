"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  const handleReenviar = async () => {
    try {
      const res = await fetch(`/api/facturas/${factura.id}/reenviar`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert("Factura reenviada correctamente a AEAT.");
        window.location.reload();
      } else {
        alert("Error al reintentar envío: " + data.message);
      }
    } catch (error) {
      alert("Error inesperado al reenviar la factura.");
      console.error(error);
    }
  };

  if (loading) return <p className="p-6">Cargando factura...</p>;
  if (!factura) return <p className="p-6">Factura no encontrada.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Detalle de Factura</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Número:</p>
          <p className="font-semibold">{factura.numero}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Estado AEAT:</p>
          <p className="font-semibold">{factura.estado}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">CSV:</p>
          <p className="font-semibold">{factura.csv || "No disponible"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fecha de emisión:</p>
          <p className="font-semibold">
            {factura.fecha_emisor
              ? new Date(factura.fecha_emisor).toLocaleDateString()
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fecha de vencimiento:</p>
          <p className="font-semibold">
            {factura.fecha_vencim
              ? new Date(factura.fecha_vencim).toLocaleDateString()
              : "-"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Cliente ID:</p>
          <p className="font-semibold">{factura.cliente_id || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Base imponible:</p>
          <p className="font-semibold">{factura.base_imponible} €</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">IVA:</p>
          <p className="font-semibold">
            {factura.iva_percent}% → {factura.iva_total} €
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total:</p>
          <p className="font-semibold text-green-700">{factura.total} €</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Servicio:</p>
          <p className="font-semibold">{factura.servicio || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Medio de envío:</p>
          <p className="font-semibold">{factura.via || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Creada en:</p>
          <p className="font-semibold">
            {factura.created_at
              ? new Date(factura.created_at).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>

      {/* Enlace PDF */}
      {factura.enlace_pdf && (
        <div className="mt-4">
          <a
            href={factura.enlace_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Descargar PDF
          </a>
        </div>
      )}

      {/* JSON completo */}
      {factura.json_factura && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Datos JSON</h2>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(factura.json_factura, null, 2)}
          </pre>
        </div>
      )}

      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        className="mt-6 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        ← Volver
      </button>

      {/* Botón de reintento */}
      {(factura.estado === "ERROR" || factura.estado === "RECHAZADA") && (
        <button
          onClick={handleReenviar}
          className="mt-4 ml-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Reintentar envío a AEAT
        </button>
      )}
    </div>
  );
}
