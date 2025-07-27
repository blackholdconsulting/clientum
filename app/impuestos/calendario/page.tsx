"use client";

import { useState } from "react";
import { DateRange } from "react-date-range";
import Link from "next/link";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface Vencimiento {
  code: string;
  name: string;
  dueDate: string;
}

const VENCIMIENTOS: Vencimiento[] = [
  { code: "303", name: "Declaración de IVA", dueDate: "20/10/2025" },
  { code: "349", name: "Intracomunitarias (IVA)", dueDate: "30/10/2025" },
  { code: "369", name: "IVA OSS", dueDate: "15/10/2025" },
  { code: "130", name: "IRPF PF", dueDate: "20/10/2025" },
  { code: "115", name: "Retenciones Inmobiliario", dueDate: "21/10/2025" },
  { code: "123", name: "Retenciones Mobiliario", dueDate: "22/10/2025" },
  { code: "200", name: "Impuesto Sociedades", dueDate: "30/11/2025" },
  { code: "390", name: "IVA Anual", dueDate: "30/04/2026" },
  // … añade más según tu calendario real
];

export default function CalendarioFiscalPage() {
  const [selectionRange, setSelectionRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges: any) => {
    setSelectionRange([ranges.selection]);
  };

  return (
    <main className="p-6 bg-white rounded-md shadow-lg space-y-8">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendario Fiscal</h1>
        <Link
          href="/impuestos"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
        >
          ← Volver
        </Link>
      </header>

      {/* Calendario */}
      <div className="bg-white border rounded p-4">
        <DateRange
          ranges={selectionRange}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          editableDateInputs
          months={2}
          direction="horizontal"
          className="mx-auto"
        />
      </div>

      {/* Tabla de vencimientos */}
      <section>
        <h2 className="text-lg font-medium mb-4">Fechas de presentación</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Formulario</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {VENCIMIENTOS.map((v) => (
                <tr key={v.code} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono">{v.code}</td>
                  <td className="px-4 py-2">{v.name}</td>
                  <td className="px-4 py-2">{v.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
