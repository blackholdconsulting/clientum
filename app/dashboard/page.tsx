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
    // Aquí se debería llamar a la API /api/dashboard/kpis
    fetch("/api/dashboard/kpis")
      .then((res) => res.json())
      .then((data) => setKpis(data));

    fetch("/api/dashboard/chart")
      .then((res) => res.json())
      .then((data) => setChartData(data));
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/facturas/nueva" className="btn-dashboard">Crear Factura</Link>
        <Link href="/clientes/nuevo" className="btn-dashboard">Añadir Cliente</Link>
        <Link href="/tesoreria" className="btn-dashboard">Ver Tesorería</Link>
        <Link href="/presupuestos/nuevo" className="btn-dashboard">Crear Presupuesto</Link>
        <Link href="/NOP/opex" className="btn-dashboard">Ver OPEX</Link>
        <Link href="/NOP/capex" className="btn-dashboard">Ver CAPEX</Link>
        <Link href="/NOP/budget" className="btn-dashboard">Budget Anual</Link>
        <Link href="/contabilidad/reportes" className="btn-dashboard">Reporte Contabilidad</Link>
        <Link href="/RRHH/nominas" className="btn-dashboard">Gestión Nóminas</Link>
      </div>

      <style jsx>{`
        .btn-dashboard {
          background-color: #4f46e5;
          color: white;
          padding: 1rem;
          text-align: center;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: background-color 0.2s ease-in-out;
        }
        .btn-dashboard:hover {
          background-color: #4338ca;
        }
      `}</style>
    </div>
  );
}
