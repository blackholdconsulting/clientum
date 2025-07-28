"use client";

import { Card, CardContent } from "@/components/ui/card";

const mockData = {
  ingresos: 0,
  gastos: 0,
  beneficio: 0,
};

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-6">
      <Card>
        <CardContent className="py-4">
          <h3 className="text-sm text-muted-foreground mb-1">Ingresos</h3>
          <p className="text-2xl font-semibold">€{mockData.ingresos.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <h3 className="text-sm text-muted-foreground mb-1">Gastos</h3>
          <p className="text-2xl font-semibold">€{mockData.gastos.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <h3 className="text-sm text-muted-foreground mb-1">Beneficio</h3>
          <p className="text-2xl font-semibold">€{mockData.beneficio.toFixed(2)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
