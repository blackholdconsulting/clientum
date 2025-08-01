"use client";

import Link from "next/link";

export default function TesoreriaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tesorería</h1>
      <p className="mb-6 text-gray-700">Gestiona todas tus cuentas y movimientos financieros.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/tesoreria/cuentas" className="p-4 bg-blue-100 hover:bg-blue-200 rounded shadow">
          Cuentas
        </Link>
        <Link href="/tesoreria/cashflow" className="p-4 bg-green-100 hover:bg-green-200 rounded shadow">
          Cashflow
        </Link>
        <Link href="/tesoreria/pagos-cobros" className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded shadow">
          Pagos y Cobros
        </Link>
        <Link href="/tesoreria/remesas" className="p-4 bg-purple-100 hover:bg-purple-200 rounded shadow">
          Remesas
        </Link>
      </div>
    </div>
  );
}
