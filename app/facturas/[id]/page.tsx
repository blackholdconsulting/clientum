"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExportarPDFButton from "@/components/ExportarPDFButton";

export default function DetalleFacturaPage() {
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
          alert("Error al cargar factura: " + data.message);
        }
      } catch (error) {
        console.error("Error cargando factura:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id]);

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

  const handleEnviarFacturae = async () => {
    const res = await fetch(`/api/sii/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facturaId: factura.id })
    });
    const data = await res.json();
    alert(data.success ? "✅ Factura enviada a Facturae" : "❌ Error: " + data.message);
  };

  const handleEnviarVerifactu = async () => {
    const res = await fetch(`/api/sii/verifactu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facturaId: factura.id })
    });
    const data = await res.json();
    alert(data.success ? "✅ Factura enviada a Verifactu" : "❌ Error: " + data.message);
  };

  if (loading) return <p className="p-6">Cargando factura...</p>;
  if (!factura) return <p className="p-6">Factura no encontrada.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Factura #{factura.numero}</h1>
        {getEstadoBadge(factura.estado)}
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3 mb-6">
        <ExportarPDFButton factura={factura} />
        <button
          onClick={handleEnviarFacturae}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Enviar Facturae
        </button>
        <button
          onClick={handleEnviarVerifactu}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Enviar Verifactu
        </button>
        <button
          onClick={() => router.push("/facturas")}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          ← Volver
        </button>
      </div>

      {/* Datos principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded shadow-sm">
          <p><strong>Fecha emisión:</strong> {factura.fecha_emisor}</p>
          <p><strong>Fecha vencimiento:</strong> {factura.fecha_vencim}</p>
          <p><strong>Cliente:</strong> {factura.receptor || factura.cliente_id}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded shadow-sm">
          <p><strong>Emisor:</strong> {factura.emisor}</p>
          <p><strong>Estado:</strong> {factura.estado}</p>
          <p><strong>Servicio:</strong> {factura.servicio || "No especificado"}</p>
        </div>
      </div>

      {/* Conceptos */}
      <div className="bg-gray-50 p-4 rounded shadow-sm">
        <h2 className="text-xl font-bold mb-3">Conceptos</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-right">Unidades</th>
              <th className="p-2 text-right">Precio</th>
              <th className="p-2 text-right">IVA %</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {factura.json_factura?.conceptos ? (
              factura.json_factura.conceptos.map((c: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{c.descripcion}</td>
                  <td className="p-2 text-right">{c.cantidad}</td>
                  <td className="p-2 text-right">{c.precio.toFixed(2)} €</td>
                  <td className="p-2 text-right">{c.iva}%</td>
                  <td className="p-2 text-right">
                    {(c.cantidad * c.precio * (1 + c.iva / 100)).toFixed(2)} €
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2">{factura.concepto}</td>
                <td className="p-2 text-right">1</td>
                <td className="p-2 text-right">{factura.base_imponib} €</td>
                <td className="p-2 text-right">{factura.iva_percent}%</td>
                <td className="p-2 text-right">{factura.total} €</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="mt-6 bg-gray-100 p-4 rounded shadow-sm">
        <div className="flex justify-between">
          <span className="font-bold">Base imponible:</span>
          <span>{factura.base_imponib} €</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">IVA total:</span>
          <span>{factura.iva_total} €</span>
        </div>
        <div className="flex justify-between text-xl font-bold mt-3">
          <span>Total:</span>
          <span>{factura.total} €</span>
        </div>
      </div>
    </div>
  );
}
