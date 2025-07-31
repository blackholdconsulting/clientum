// File: /app/gastos/page.tsx
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function GastosDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Gastos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link href="/gastos/ventas" className="block">
              <h2 className="text-xl font-semibold mb-2">📒 Ventas e Ingresos</h2>
              <p className="text-sm text-gray-600">
                Consulta tu libro de ventas, aplica filtros y exporta tus datos.
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link href="/gastos/compras" className="block">
              <h2 className="text-xl font-semibold mb-2">📕 Compras y Gastos</h2>
              <p className="text-sm text-gray-600">
                Revisa tu libro de compras, filtra por fecha/cliente y genera informes.
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Link href="/gastos/amortizaciones" className="block">
              <h2 className="text-xl font-semibold mb-2">📗 Amortizaciones</h2>
              <p className="text-sm text-gray-600">
                Gestiona y visualiza tu plan de amortizaciones, exporta a PDF/CSV.
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
