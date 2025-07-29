"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface KpiData {
  ingresos: number;
  gastos: number;
  beneficio: number;
  facturasPendientes: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData>({
    ingresos: 0,
    gastos: 0,
    beneficio: 0,
    facturasPendientes: 0,
  });

  const [chartData, setChartData] = useState<
    { mes: string; ingresos: number; gastos: number }[]
  >([]);

  useEffect(() => {
    // Datos simulados - reemplazar con fetch a la API real
    setKpis({
      ingresos: 12500,
      gastos: 8200,
      beneficio: 4300,
      facturasPendientes: 5,
    });

    setChartData([
      { mes: "Ene", ingresos: 3000, gastos: 1500 },
      { mes: "Feb", ingresos: 3500, gastos: 1800 },
      { mes: "Mar", ingresos: 4000, gastos: 2000 },
      { mes: "Abr", ingresos: 4200, gastos: 2100 },
      { mes: "May", ingresos: 3800, gastos: 2300 },
      { mes: "Jun", ingresos: 5000, gastos: 2500 },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Ingresos</h2>
          <p className="text-2xl font-bold text-green-600">{kpis.ingresos.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Gastos</h2>
          <p className="text-2xl font-bold text-red-600">{kpis.gastos.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Beneficio</h2>
          <p
            className={`text-2xl font-bold ${
              kpis.beneficio >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {kpis.beneficio.toFixed(2)} €
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Facturas Pendientes</h2>
          <p className="text-2xl font-bold text-yellow-600">{kpis.facturasPendientes}</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Evolución de Ingresos y Gastos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ingresos" stroke="#16a34a" name="Ingresos (€)" />
            <Line type="monotone" dataKey="gastos" stroke="#dc2626" name="Gastos (€)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/facturas/nueva"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Crear Factura
        </Link>
        <Link
          href="/clientes/nuevo"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Añadir Cliente
        </Link>
        <Link
          href="/tesoreria"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Ver Tesorería
        </Link>
      </div>
    </div>
  );
}
