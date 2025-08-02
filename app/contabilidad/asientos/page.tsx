// app/contabilidad/asientos/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseServer";
import { jsPDF } from "jspdf";

interface Asiento {
  id: string;
  fecha: string;
  factura: string;
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export default function AsientosPage() {
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("asiento_contable")
        .select(`
          id,
          fecha,
          factura_id:factura_id (serie, numero),
          cuenta_id:cuenta_id (nombre),
          descripcion,
          debe,
          haber
        `)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error al cargar asientos:", error);
      } else if (data) {
        setAsientos(
          data.map((row: any) => ({
            id: row.id,
            fecha: row.fecha,
            factura: `${row.factura_id.serie}${row.factura_id.numero}`,
            cuenta: row.cuenta_id.nombre,
            descripcion: row.descripcion,
            debe: row.debe,
            haber: row.haber,
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const exportCSV = () => {
    if (!asientos.length) return;
    const header = ["Fecha", "Factura", "Cuenta", "Descripción", "Debe", "Haber"];
    const rows = asientos.map(a => [
      a.fecha,
      a.factura,
      a.cuenta,
      a.descripcion,
      a.debe.toFixed(2),
      a.haber.toFixed(2),
    ]);

    const csvContent =
      [header, ...rows]
        .map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asientos_contables_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!asientos.length) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFontSize(14);
    doc.text("Asientos Contables", 40, 40);

    const tableColumn = ["Fecha", "Factura", "Cuenta", "Descripción", "Debe", "Haber"];
    const tableRows = asientos.map(a => [
      a.fecha,
      a.factura,
      a.cuenta,
      a.descripcion,
      a.debe.toFixed(2),
      a.haber.toFixed(2),
    ]);

    // simple table
    let startY = 60;
    doc.setFontSize(10);
    // header
    tableColumn.forEach((col, i) => {
      doc.text(col, 40 + i * 80, startY);
    });
    // rows
    tableRows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        doc.text(cell, 40 + ci * 80, startY + 20 + ri * 20);
      });
    });

    doc.save(`asientos_contables_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Asientos Contables</h1>
        <div className="space-x-2">
          <Link
            href="/contabilidad/asientos/nuevo"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            + Añadir Asiento
          </Link>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : asientos.length === 0 ? (
        <p>No hay asientos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Fecha</th>
                <th className="border px-2 py-1">Factura</th>
                <th className="border px-2 py-1">Cuenta</th>
                <th className="border px-2 py-1">Descripción</th>
                <th className="border px-2 py-1 text-right">Debe</th>
                <th className="border px-2 py-1 text-right">Haber</th>
              </tr>
            </thead>
            <tbody>
              {asientos.map(a => (
                <tr key={a.id}>
                  <td className="border px-2 py-1">{a.fecha}</td>
                  <td className="border px-2 py-1">{a.factura}</td>
                  <td className="border px-2 py-1">{a.cuenta}</td>
                  <td className="border px-2 py-1">{a.descripcion}</td>
                  <td className="border px-2 py-1 text-right">{a.debe.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-right">{a.haber.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
