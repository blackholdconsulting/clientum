"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Asiento = {
  id: string;
  fecha: string;
  descripcion: string;
  debe: number;
  haber: number;
  facturas: { serie: string; numero: string };
  cuentas: { codigo: string; nombre: string };
};

export default function AsientosPage() {
  const [asientos, setAsientos] = useState<Asiento[]>([]);

  useEffect(() => {
    axios.get<Asiento[]>("/api/asiento_contable")
      .then(res => setAsientos(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Asientos Contables</h1>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            {["Fecha","Factura","Cuenta","Descripción","Debe","Haber"].map(h => (
              <th key={h} className="px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {asientos.map(a => (
            <tr key={a.id} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2">{a.fecha}</td>
              <td className="px-3 py-2">{a.facturas.serie}{a.facturas.numero}</td>
              <td className="px-3 py-2">{a.cuentas.codigo} – {a.cuentas.nombre}</td>
              <td className="px-3 py-2">{a.descripcion}</td>
              <td className="px-3 py-2 text-right">{a.debe.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{a.haber.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
