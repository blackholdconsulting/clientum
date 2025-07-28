// app/RR.HH/vacaciones/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../../../lib/database.types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";

type Vacacion = Database["public"]["Tables"]["vacaciones"]["Row"];

export default function VacacionesPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("vacaciones")
      .select("*")
      .order("start_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setVacaciones(data);
        setLoading(false);
      });
  }, [supabase]);

  const exportCSV = () => {
    const header = ["Empleado", "Inicio", "Fin", "Tipo", "Motivo"];
    const rows = vacaciones.map(v => [
      v.empleado_id,
      v.start_date,
      v.end_date,
      v.tipo,
      v.motivo ?? ""
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vacaciones.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Solicitud de Vacaciones", 20, 20);
    vacaciones.forEach((v, i) => {
      const y = 30 + i * 20;
      doc.text(`Empleado: ${v.empleado_id}`, 20, y);
      doc.text(`Desde: ${v.start_date}`, 20, y + 6);
      doc.text(`Hasta: ${v.end_date}`, 20, y + 12);
      doc.text(`Tipo: ${v.tipo}`, 100, y);
      doc.text(`Motivo: ${v.motivo ?? "-"}`, 100, y + 6);
      doc.line(20, y + 18, 190, y + 18);
    });
    doc.save("vacaciones.pdf");
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Vacaciones</h1>
        </div>
        <Link href="/RR.HH/vacaciones/nuevo">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Solicitar vacaciones
          </button>
        </Link>
      </div>

      {vacaciones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded shadow">
          <svg
            className="mx-auto h-24 w-24 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 64 64"
            stroke="currentColor"
          >
            <circle cx="32" cy="32" r="30" strokeWidth="4" />
            <path strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M20 32h24M32 20v24" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold">Sin vacaciones</h2>
          <p className="mt-2 text-gray-500">Todavía no hay solicitudes de vacaciones.</p>
          <Link href="/RR.HH/vacaciones/nuevo">
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Solicitar vacaciones
            </button>
          </Link>
          <p className="mt-8 text-sm">
            <Link href="https://docs.clientum.com/vacaciones" className="text-blue-600 hover:underline">
              Consulta la política de vacaciones
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-end space-x-2 mb-4">
            <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Exportar CSV
            </button>
            <button onClick={exportPDF} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Generar PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Empleado</th>
                  <th className="px-4 py-2">Inicio</th>
                  <th className="px-4 py-2">Fin</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {vacaciones.map(v => (
                  <tr key={v.id} className="border-t">
                    <td className="px-4 py-2">{v.empleado_id}</td>
                    <td className="px-4 py-2">{v.start_date}</td>
                    <td className="px-4 py-2">{v.end_date}</td>
                    <td className="px-4 py-2">{v.tipo}</td>
                    <td className="px-4 py-2">{v.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        </div>
      )}
    </div>
  );
}
