"use client";

import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

interface Asiento {
  id: string;
  factura: string;
  fecha: string;
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export default function AsientosPage() {
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contabilidad/asientos")
      .then((r) => r.json())
      .then((data) => {
        setAsientos(data);
        setLoading(false);
      });
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Fecha", "Factura", "Cuenta", "Desc.", "Debe", "Haber"]],
      body: asientos.map(a => [a.fecha, a.factura, a.cuenta, a.descripcion, a.debe, a.haber]),
    });
    doc.save("asientos_contables.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Asientos Contables</h1>
      <div className="flex gap-2 mb-4">
        <Link href="/contabilidad/asientos/nuevo" className="bg-green-600 text-white px-4 py-2 rounded">
          + Añadir Asiento
        </Link>
        <button
          onClick={exportPDF}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
        <CSVLink
          data={asientos}
          headers={[
            { label: "Fecha", key: "fecha" },
            { label: "Factura", key: "factura" },
            { label: "Cuenta", key: "cuenta" },
            { label: "Descripción", key: "descripcion" },
            { label: "Debe", key: "debe" },
            { label: "Haber", key: "haber" },
          ]}
          filename="asientos.csv"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Exportar CSV
        </CSVLink>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {["Fecha","Factura","Cuenta","Descripción","Debe","Haber"].map(h => (
                <th key={h} className="border px-4 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {asientos.map(a => (
              <tr key={a.id}>
                <td className="border px-4 py-2">{a.fecha}</td>
                <td className="border px-4 py-2">{a.factura}</td>
                <td className="border px-4 py-2">{a.cuenta}</td>
                <td className="border px-4 py-2">{a.descripcion}</td>
                <td className="border px-4 py-2 text-right">{a.debe.toFixed(2)}</td>
                <td className="border px-4 py-2 text-right">{a.haber.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
