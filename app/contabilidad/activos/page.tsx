"use client";

import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Activo {
  id: string;
  nombre: string;
  codigo: string;
  grupo: string;
  valor: number;
  amortizacion: number;
  saldo: number;
}

export default function ActivosPage() {
  const router = useRouter();
  const [activos, setActivos] = useState<Activo[]>([]);
  const [filter, setFilter] = useState("all");

  // Carga de activos
  useEffect(() => {
    fetch(`/api/contabilidad/activos?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => setActivos(data.activos || []));
  }, [filter]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (activos.length === 0) return;
    const header = ["Activo","Código","Grupo","Valor","Amortización","Saldo"];
    const rows = activos.map(a => [
      a.nombre,
      a.codigo,
      a.grupo,
      a.valor.toFixed(2),
      a.amortizacion.toFixed(2),
      a.saldo.toFixed(2),
    ]);
    const csvContent =
      [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activos]);

  // Export PDF
  const exportPDF = useCallback(() => {
    if (activos.length === 0) return;
    const doc = new jsPDF();
    doc.text("Listado de Activos", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Activo","Código","Grupo","Valor","Amortización","Saldo"]],
      body: activos.map(a => [
        a.nombre,
        a.codigo,
        a.grupo,
        a.valor.toFixed(2),
        a.amortizacion.toFixed(2),
        a.saldo.toFixed(2),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 119, 255] }
    });
    doc.save(`activos_${new Date().toISOString().slice(0,10)}.pdf`);
  }, [activos]);

  return (
    <div className="p-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold">Activos</h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border rounded hover:bg-gray-100">
            Importar
          </button>

          {/* Exportar CSV/PDF directo */}
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Exportar PDF
          </button>

          {/* Nuevo activo */}
          <button
            onClick={() => router.push("/contabilidad/activos/nuevo-activo")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nuevo activo
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Todos</option>
          <option value="grupo1">Grupo 1</option>
          <option value="grupo2">Grupo 2</option>
        </select>
      </div>

      {/* Tabla de activos */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Activo</th>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2 text-right">Valor</th>
              <th className="px-4 py-2 text-right">Amortización</th>
              <th className="px-4 py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {activos.length > 0 ? (
              activos.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.nombre}</td>
                  <td className="px-4 py-2">{a.codigo}</td>
                  <td className="px-4 py-2">{a.grupo}</td>
                  <td className="px-4 py-2 text-right">{a.valor.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{a.amortizacion.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{a.saldo.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No tienes activos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
