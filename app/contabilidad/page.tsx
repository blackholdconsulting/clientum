// app/contabilidad/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface Factura {
  fecha_emisor: string;
  total: number;
  iva_total: number;
  estado: string;
}

export default function ContabilidadPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacturas() {
      setLoading(true);

      // 1) Obtenemos primero el usuario logueado
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("No autenticado", userError);
        setLoading(false);
        return;
      }

      // 2) Hacemos la consulta con el user.id
      const { data: facturaData, error: factError } = await supabase
        .from("facturas")
        .select("fecha_emisor, total, iva_total, estado")
        .eq("user_id", user.id);

      if (factError) {
        console.error("Error cargando facturas:", factError);
      } else if (facturaData) {
        setFacturas(facturaData as Factura[]);
      }
      setLoading(false);
    }

    loadFacturas();
  }, [supabase]);

  if (loading) return <p>Cargando contabilidad…</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contabilidad</h1>
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Total (€)</th>
            <th>IVA (€)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f, i) => (
            <tr key={i} className="border-t">
              <td>{new Date(f.fecha_emisor).toLocaleDateString()}</td>
              <td>{f.total.toFixed(2)}</td>
              <td>{f.iva_total.toFixed(2)}</td>
              <td>{f.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => router.push("/facturas/new")}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Nueva Factura
      </button>
    </main>
  );
}
