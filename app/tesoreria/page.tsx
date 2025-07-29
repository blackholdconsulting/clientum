"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    // Aquí llamarías a tu API para calcular los valores reales
    setKpi({
      saldoTotal: 15230.45,
      entradasMes: 4320.5,
      salidasMes: 1890.75,
    });
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
          <p className="text-2xl font-bold">
            {(kpi.entradasMes - kpi.salidasMes).toFixed(2)} €
          </p>
        </div>
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
