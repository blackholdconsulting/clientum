// File: /app/gastos/page.tsx
"use client";

import React from "react";

interface Apunte {
  fecha: string;
  codigo: string;
  concepto: string;
  documento: string;
  cuenta: string;
  debe?: string;
  haber?: string;
  contrapartida?: string;
  tipo: string;
  obs?: string;
}

interface Amortizacion {
  fecha: string;
  codigo: string;
  activo: string;
  base: string;
  acumulada: string;
  anual: string;
}

const ventas: Apunte[] = [
  {
    fecha: "31/07/2024",
    codigo: "1",
    concepto: "Venta a CLIENTES (EUROS)",
    documento: "1",
    cuenta: "70000000",
    haber: "1 000,00",
    contrapartida: "43000000",
    tipo: "F. Expedida",
  },
  {
    fecha: "31/07/2024",
    codigo: "1",
    concepto: "IVA R. CLIENTES (EUROS)",
    documento: "1",
    cuenta: "47700000",
    haber: "210,00",
    contrapartida: "43000000",
    tipo: "F. Expedida",
  },
];

const compras: Apunte[] = [
  {
    fecha: "31/07/2024",
    codigo: "10",
    concepto: "Compra a PROVEEDORES (EUROS)",
    documento: "1825",
    cuenta: "60000000",
    debe: "99,17",
    contrapartida: "40000000",
    tipo: "F. Recibida",
  },
  {
    fecha: "31/07/2024",
    codigo: "10",
    concepto: "IVA S. PROVEEDORES (EUROS)",
    documento: "1825",
    cuenta: "47200000",
    debe: "20,83",
    contrapartida: "40000000",
    tipo: "F. Recibida",
  },
];

const amortizaciones: Amortizacion[] = [
  {
    fecha: "31/07/2024",
    codigo: "A01",
    activo: "Equipo Informático",
    base: "5 000,00",
    acumulada: "1 250,00",
    anual: "500,00",
  },
  {
    fecha: "31/07/2024",
    codigo: "A02",
    activo: "Maquinaria",
    base: "12 000,00",
    acumulada: "3 000,00",
    anual: "1 000,00",
  },
];

export default function GastosPage() {
  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Gastos</h1>

      {/* Libro de ventas e ingresos */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          📒 Libro de ventas e ingresos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Cód.</th>
                <th className="px-3 py-2 text-left">Concepto</th>
                <th className="px-3 py-2 text-left">Doc.</th>
                <th className="px-3 py-2 text-left">Cuenta</th>
                <th className="px-3 py-2 text-right">Debe</th>
                <th className="px-3 py-2 text-right">Haber</th>
                <th className="px-3 py-2 text-left">Contrapartida</th>
                <th className="px-3 py-2 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ventas.map((a, i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="px-3 py-2">{a.fecha}</td>
                  <td className="px-3 py-2">{a.codigo}</td>
                  <td className="px-3 py-2">{a.concepto}</td>
                  <td className="px-3 py-2">{a.documento}</td>
                  <td className="px-3 py-2">{a.cuenta}</td>
                  <td className="px-3 py-2 text-right">{a.debe || "–"}</td>
                  <td className="px-3 py-2 text-right">{a.haber || "–"}</td>
                  <td className="px-3 py-2">{a.contrapartida}</td>
                  <td className="px-3 py-2">{a.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Libro de compras y gastos */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          📕 Libro de compras y gastos
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Cód.</th>
                <th className="px-3 py-2 text-left">Concepto</th>
                <th className="px-3 py-2 text-left">Doc.</th>
                <th className="px-3 py-2 text-left">Cuenta</th>
                <th className="px-3 py-2 text-right">Debe</th>
                <th className="px-3 py-2 text-right">Haber</th>
                <th className="px-3 py-2 text-left">Contrapartida</th>
                <th className="px-3 py-2 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compras.map((a, i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="px-3 py-2">{a.fecha}</td>
                  <td className="px-3 py-2">{a.codigo}</td>
                  <td className="px-3 py-2">{a.concepto}</td>
                  <td className="px-3 py-2">{a.documento}</td>
                  <td className="px-3 py-2">{a.cuenta}</td>
                  <td className="px-3 py-2 text-right">{a.debe || "–"}</td>
                  <td className="px-3 py-2 text-right">{a.haber || "–"}</td>
                  <td className="px-3 py-2">{a.contrapartida}</td>
                  <td className="px-3 py-2">{a.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Libro de Amortizaciones */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          📗 Libro de amortizaciones
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Cód.</th>
                <th className="px-3 py-2 text-left">Activo</th>
                <th className="px-3 py-2 text-right">Base</th>
                <th className="px-3 py-2 text-right">Acumulada</th>
                <th className="px-3 py-2 text-right">Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {amortizaciones.map((a, i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50"}>
                  <td className="px-3 py-2">{a.fecha}</td>
                  <td className="px-3 py-2">{a.codigo}</td>
                  <td className="px-3 py-2">{a.activo}</td>
                  <td className="px-3 py-2 text-right">{a.base}</td>
                  <td className="px-3 py-2 text-right">{a.acumulada}</td>
                  <td className="px-3 py-2 text-right">{a.anual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
