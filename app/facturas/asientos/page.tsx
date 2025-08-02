"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseServer";
import jsPDF from "jspdf";

interface Asiento {
  factura: string;
  fecha: string;
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export default function AsientosPage() {
  const router = useRouter();
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from<"asiento_contable", Asiento>("asiento_contable")
        .select("factura,fecha,cuenta,descripcion,debe,haber");
      if (error) {
        console.error(error);
      } else {
        setAsientos(data);
      }
      setLoading(false);
    })();
  }, []);

  const handleAdd = () => {
    router.push("/contabilidad/asientos/nuevo");
  };

  const exportCsv = () => {
    const headers = ["Fecha", "Factura", "Cuenta", "Descripción", "Debe", "Haber"];
    const rows = asientos.map(a => [
      a.fecha,
      a.factura,
      a.cuenta,
      a.descripcion,
      a.debe.toString(),
      a.haber.toString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "asientos_contables.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Asientos Contables", 14, 20);
    (doc as any).autoTable({
      startY: 30,
      head: [["Fecha","Factura","Cuenta","Descripción","Debe","Haber"]],
      body: asientos.map(a => [a.fecha, a.factura, a.cuenta, a.descripcion, a.debe, a.haber]),
    });
    doc.save("asientos_contables.pdf");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Asientos Contables</h1>
        <div className="space-x-2">
          <button
            onClick={handleAdd}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            + Añadir Asiento
          </button>
          <button
            onClick={exportCsv}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportPdf}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Factura</th>
              <th className="px-4 py-2">Cuenta</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Debe</th>
              <th className="px-4 py-2">Haber</th>
            </tr>
          </thead>
          <tbody>
            {asientos.map((a, i) => (
              <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                <td className="px-4 py-2">{a.fecha}</td>
                <td className="px-4 py-2">{a.factura}</td>
                <td className="px-4 py-2">{a.cuenta}</td>
                <td className="px-4 py-2">{a.descripcion}</td>
                <td className="px-4 py-2 text-right">{a.debe.toFixed(2)}€</td>
                <td className="px-4 py-2 text-right">{a.haber.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
