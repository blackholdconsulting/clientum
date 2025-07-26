"use client";

import { useState } from "react";
import { DateRange } from "react-date-range";
import Link from "next/link";

// Importa los estilos predeterminados de react-date-range:
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function CalendarioFiscalPage() {
  const [selectionRange, setSelectionRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges: any) => {
    // ranges.selection contiene { startDate, endDate, key }
    setSelectionRange([ranges.selection]);
  };

  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      {/* Cabecera con botón de Volver */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Calendario Fiscal</h1>
        <Link
          href="/impuestos"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
        >
          ← Volver
        </Link>
      </header>

      {/* Contenedor del calendario */}
      <div className="bg-white border rounded p-4">
        <DateRange
          ranges={selectionRange}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          editableDateInputs={true}
          months={2}
          direction="horizontal"
          className="mx-auto"
        />
      </div>
    </main>
  );
}
