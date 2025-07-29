"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

interface Kpi {
  saldoTotal: number;
  entradasMes: number;
  salidasMes: number;
}

export default function TesoreriaDashboard() {
  const [kpi, setKpi] = useState<Kpi>({
    saldoTotal: 0,
    entradasMes: 0,
    salidasMes: 0,
  });

  const [cashflowData, setCashflowData] = useState<
    { mes: string; entradas: number; salidas: number }[]
  >([]);

  useEffect(() => {
    // Simulación de datos - reemplazar con fetch a la API real
    setKpi({
      saldoTotal: 15230.45,
      entradasMes: 4320.5,
      salidasMes: 1890.75,
    });

    setCashflowData([
      { mes: "Ene", entradas: 3000, salidas: 1500 },
      { mes: "Feb", entradas: 3500, salidas: 2000 },
      { mes: "Mar", entradas: 4000, salidas: 1800 },
      { mes: "Abr", entradas: 4200, salidas: 2100 },
      { mes: "May", entradas: 3800, salidas: 2300 },
      { mes: "Jun", entradas: 5000, salidas: 2500 },
      { mes: "Jul", entradas: 4700, salidas: 2200 },
      { mes: "Ago", entradas: 4900, salidas: 2400 },
      { mes: "Sep", entradas: 5100, salidas: 2600 },
      { mes: "Oct", entradas: 5300, salidas: 2700 },
      { mes: "Nov", entradas: 5500, salidas: 2800 },
      { mes: "Dic", entradas: 6000, salidas: 3000 },
    ]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Tesorería</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded-lg text-center">
          <h2 className="text-lg font-semibold">Saldo Total</h2>
          <p className="text-2xl font-bold text-green-600">{kpi.saldoTotal.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg text-center">
          <h2 className="text-lg font-semibold">Entradas del Mes</h2>
          <p className="text-2xl font-bold text-blue-600">{kpi.entradasMes.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg text-center">
          <h2 className="text-lg font-semibold">Salidas del Mes</h2>
          <p className="text-2xl font-bold text-red-600">{kpi.salidasMes.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg text-center">
          <h2 className="text-lg font-semibold">Balance Neto</h2>
          <p
            className={`text-2xl font-bold ${
              kpi.entradasMes - kpi.salidasMes >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {(kpi.entradasMes - kpi.salidasMes).toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Gráfico de Cashflow */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Evolución del Cashflow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cashflowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="entradas" stroke="#16a34a" name="Entradas (€)" />
            <Line type="monotone" dataKey="salidas" stroke="#dc2626" name="Salidas (€)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/tesoreria/cuentas"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Ver Cuentas
        </Link>
        <Link
          href="/tesoreria/pagos-cobros"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Pagos y Cobros
        </Link>
        <Link
          href="/tesoreria/remesas"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Remesas
        </Link>
        <Link
          href="/tesoreria/cashflow"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow hover:bg-indigo-700 text-center"
        >
          Cashflow Detallado
        </Link>
      </div>
    </div>
  );
}
