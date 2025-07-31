// File: /app/gastos/amortizaciones/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CSVLink } from "react-csv";

interface Amort {
  id: string;
  activo: string;
  fecha: string;
  cuota: number;
  acumulada: number;
}

export default function LibroAmortizacionesPage() {
  const [hasta, setHasta] = useState("");
  const [datos, setDatos] = useState<Amort[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasta) return;
    setLoading(true);

    supabase.auth
      .getSession()
      .then(({ data }) => data.session?.user.id)
      .then((uid) =>
        supabase
          .from<Amort>("amortizaciones")
          .select(`
            id,
            activos(nombre) as activo,
            fecha,
            cuota,
            acumulada
          `)
          .eq("user_id", uid)
          .lte("fecha", hasta)
          .order("fecha", { ascending: true })
      )
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setDatos(data ?? []);
      })
      .finally(() => setLoading(false));
  }, [hasta]);

  const sumCuota     = datos.reduce((s, v) => s + v.cuota, 0);
  const sumAcumulada = datos.reduce((s, v) => s + v.acumulada, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📗 Libro de Amortizaciones</h1>
      {/* filtro “hasta” + botones export */}
      {/* tabla con activo, fecha, cuota, acumulada y pie de totales */}
      …
    </div>
  );
}
