// app/dashboard/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0,00€</p>
            <p className="text-sm text-muted-foreground">Año actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0,00€</p>
            <p className="text-sm text-muted-foreground">Año actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beneficio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">0,00€</p>
            <p className="text-sm text-muted-foreground">Año actual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de ventas (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Julio 2025</p>
            {/* Aquí podrías insertar un gráfico con Recharts o Chart.js */}
            <div className="h-32 bg-gray-200 mt-2 rounded" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen de gastos (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Julio 2025</p>
            <div className="h-32 bg-gray-200 mt-2 rounded" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pagos pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">0,00€</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cobros pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">0,00€</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
