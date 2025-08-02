"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface LineaRaw {
  factura_id: string;
  serie: string;
  numero: string;
  fecha: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  iva_porc: number;
  cuenta_id: string;
}

interface Asiento {
  factura: string;
  fecha: string;
  cuenta: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export default function InformeAsientosPage() {
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) Traer todas las líneas de todas las facturas del usuario
      const { data, error } = await supabase
        .from<LineaRaw>("facturas")
        .select(`
          id:serie || numero,
          serie,
          numero,
          fecha,
          lineas:lineas (
            descripcion,
            cantidad,
            precio,
            iva_porc,
            cuenta_id
          )
        `)
        .order("fecha", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // 2) Desenrollar las líneas y mapear a asiento contable
      const rows: Asiento[] = [];
      data?.forEach(f => {
        const facturaNum = `${f.serie}${f.numero}`;
        const fecha       = f.fecha.split("T")[0];

        f.lineas.forEach(l => {
          const base  = l.cantidad * l.precio;
          const iva   = base * (l.iva_porc / 100);
          // a) Débito: cliente (cuenta 430) por total factura
          rows.push({
            factura: facturaNum,
            fecha,
            cuenta: "430 CLIENTES",
            descripcion: l.descripcion,
            debe: +(base + iva).toFixed(2),
            haber: 0
          });
          // b) Crédito: ventas (la cuenta de la línea) por base
          rows.push({
            factura: facturaNum,
            fecha,
            cuenta: l.cuenta_id,
            descripcion: l.descripcion,
            debe: 0,
            haber: +base.toFixed(2)
          });
          // c) Crédito: IVA repercutido (cuenta 477) por importe IVA
          if (iva > 0) {
            rows.push({
              factura: facturaNum,
              fecha,
              cuenta: "477 IVA REPERCUTIDO",
              descripcion: `${l.iva_porc}% IVA`,
              debe: 0,
              haber: +iva.toFixed(2)
            });
          }
        });
      });

      setAsientos(rows);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Cargando informe…</div>;
  if (!asientos.length) return <div className="p-6">No hay datos para mostrar.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Informe de Asientos Contables</h1>
      <div className="overflow-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {["Factura","Fecha","Cuenta","Descripción","Debe","Haber"].map(h => (
                <th key={h} className="px-3 py-2 border text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {asientos.map((a,i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 border">{a.factura}</td>
                <td className="px-3 py-2 border">{a.fecha}</td>
                <td className="px-3 py-2 border">{a.cuenta}</td>
                <td className="px-3 py-2 border">{a.descripcion}</td>
                <td className="px-3 py-2 border text-right">{a.debe.toFixed(2)}</td>
                <td className="px-3 py-2 border text-right">{a.haber.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
