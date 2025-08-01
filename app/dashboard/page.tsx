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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FaRedoAlt, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";

interface KpiData {
  ingresos: number;
  gastos: number;
  beneficio: number;
  facturasPendientes: number;
}

interface ReintentoStats {
  pendientes: number;
  ultimo_intento: string | null;
  tasa_exito: number;
}

interface EstadoFacturas {
  aceptadas: number;
  rechazadas: number;
  pendientes: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData>({
    ingresos: 0,
    gastos: 0,
    beneficio: 0,
    facturasPendientes: 0,
  });
  const [chartData, setChartData] = useState<{ mes: string; ingresos: number; gastos: number }[]>([]);
  const [reintentoStats, setReintentoStats] = useState<ReintentoStats>({
    pendientes: 0,
    ultimo_intento: null,
    tasa_exito: 0,
  });
  const [estadoFacturas, setEstadoFacturas] = useState<EstadoFacturas>({
    aceptadas: 0,
    rechazadas: 0,
    pendientes: 0,
  });
  const [porcentajeRechazadas, setPorcentajeRechazadas] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resKpis = await fetch("/api/dashboard/kpis");
        if (resKpis.ok) {
          const data = await resKpis.json();
          setKpis(data);
        }

        const resChart = await fetch("/api/dashboard/chart");
        if (resChart.ok) {
          const data = await resChart.json();
          setChartData(data);
        }

        const resReintentos = await fetch("/api/dashboard/reintentos-kpi");
        if (resReintentos.ok) {
          const data = await resReintentos.json();
          setReintentoStats(data.stats);
        }

        const resEstados = await fetch("/api/dashboard/estado-facturas");
        if (resEstados.ok) {
          const data = await resEstados.json();
          setEstadoFacturas(data.stats);

          const total =
            (data.stats.aceptadas || 0) +
            (data.stats.rechazadas || 0) +
            (data.stats.pendientes || 0);

          const porcentaje =
            total > 0 ? Math.round(((data.stats.rechazadas || 0) / total) * 100) : 0;

          setPorcentajeRechazadas(porcentaje);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    fetchData();
  }, []);

  const pieData = [
    { name: "Aceptadas", value: estadoFacturas.aceptadas },
    { name: "Rechazadas", value: estadoFacturas.rechazadas },
    { name: "Pendientes", value: estadoFacturas.pendientes },
  ];

  const COLORS = ["#16a34a", "#dc2626", "#f59e0b"];

  return (
    <div className="p-6">
      {/* Banner de alerta */}
      {porcentajeRechazadas >= 30 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center space-x-3">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <p className="font-semibold">
            Atención: {porcentajeRechazadas}% de tus facturas han sido rechazadas. 
            Revisa los envíos para evitar problemas fiscales.
          </p>
        </div>
      )}

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
          <p className={`text-2xl font-bold ${kpis.beneficio >= 0 ? "text-green-600" : "text-red-600"}`}>
            {kpis.beneficio.toFixed(2)} €
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Facturas Pendientes</h2>
          <p className="text-2xl font-bold text-yellow-600">{kpis.facturasPendientes}</p>
        </div>
      </div>

      {/* Tarjeta KPI Reintentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
          <FaRedoAlt className="text-yellow-500 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Reintentos pendientes</p>
            <h2 className="text-2xl font-bold">{reintentoStats.pendientes}</h2>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
          <FaClock className="text-blue-500 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Último reintento</p>
            <h2 className="text-lg font-semibold">
              {reintentoStats.ultimo_intento
                ? new Date(reintentoStats.ultimo_intento).toLocaleString()
                : "N/A"}
            </h2>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
          <FaCheckCircle className="text-green-500 text-3xl" />
          <div>
            <p className="text-gray-500 text-sm">Tasa de éxito</p>
            <h2 className="text-2xl font-bold">{reintentoStats.tasa_exito}%</h2>
          </div>
        </div>
      </div>

      {/* Gráfico circular de estados de facturas */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Estado de Facturas</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico evolución ingresos/gastos */}
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

      {/* Botones estilo Holded */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link href="/facturas/nueva" className="card-button bg-gradient-to-r from-green-400 to-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Factura
        </Link>

        <Link href="/clientes/nuevo" className="card-button bg-gradient-to-r from-blue-400 to-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.89 0 5.556.915 7.879 2.452M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Añadir Cliente
        </Link>

        <Link href="/tesoreria" className="card-button bg-gradient-to-r from-indigo-400 to-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-3.866 0-7 2.686-7 6 0 1.657 1.343 3 3 3h8c1.657 0 3-1.343 3-3 0-3.314-3.134-6-7-6z" />
          </svg>
          Ver Tesorería
        </Link>

        <Link href="/presupuestos/nuevo" className="card-button bg-gradient-to-r from-yellow-400 to-yellow-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          Crear Presupuesto
        </Link>
      </div>

      <style jsx>{`
        .card-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          color: white;
          font-weight: 600;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
