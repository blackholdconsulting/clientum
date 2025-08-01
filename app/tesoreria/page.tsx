"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TesoreriaPage() {
  const [stats, setStats] = useState({
    cuentas: 0,
    cashflow: 0,
    pagos: 0,
    cobros: 0,
    remesas: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Ejemplo: sumar datos (esto depende de tus tablas reales)
      const { count: cuentasCount } = await supabase
        .from("cuentas")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data: pagos } = await supabase
        .from("movimientos")
        .select("monto, tipo")
        .eq("user_id", user.id);

      const pagosTotal = pagos?.filter((m) => m.tipo === "pago").reduce((acc, m) => acc + m.monto, 0) || 0;
      const cobrosTotal = pagos?.filter((m) => m.tipo === "cobro").reduce((acc, m) => acc + m.monto, 0) || 0;
      const remesasTotal = pagos?.filter((m) => m.tipo === "remesa").reduce((acc, m) => acc + m.monto, 0) || 0;

      setStats({
        cuentas: cuentasCount || 0,
        cashflow: pagosTotal + cobrosTotal,
        pagos: pagosTotal,
        cobros: cobrosTotal,
        remesas: remesasTotal,
      });
    };

    loadData();
  }, []);

  const barData = {
    labels: ["Pagos", "Cobros", "Remesas"],
    datasets: [
      {
        label: "Movimientos (€)",
        data: [stats.pagos, stats.cobros, stats.remesas],
        backgroundColor: ["#f87171", "#4ade80", "#60a5fa"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Pagos", "Cobros", "Remesas"],
    datasets: [
      {
        data: [stats.pagos, stats.cobros, stats.remesas],
        backgroundColor: ["#f87171", "#4ade80", "#60a5fa"],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tesorería</h1>
      <p className="text-gray-600 mb-6">
        Gestiona todas tus cuentas y movimientos financieros.
      </p>

      {/* Tarjetas estilo Holded */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Link href="/tesoreria/cuentas" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-lg font-semibold">Cuentas</h3>
          <p className="text-gray-500">{stats.cuentas} cuentas activas</p>
        </Link>
        <Link href="/tesoreria/cashflow" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-lg font-semibold">Cashflow</h3>
          <p className="text-gray-500">{stats.cashflow.toFixed(2)} €</p>
        </Link>
        <Link href="/tesoreria/pagos-cobros" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-lg font-semibold">Pagos y Cobros</h3>
          <p className="text-gray-500">Pagos: {stats.pagos.toFixed(2)} €</p>
          <p className="text-gray-500">Cobros: {stats.cobros.toFixed(2)} €</p>
        </Link>
        <Link href="/tesoreria/remesas" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition">
          <h3 className="text-lg font-semibold">Remesas</h3>
          <p className="text-gray-500">{stats.remesas.toFixed(2)} €</p>
        </Link>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Movimientos</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Distribución</h2>
          <Doughnut data={doughnutData} />
        </div>
      </div>
    </div>
  );
}
