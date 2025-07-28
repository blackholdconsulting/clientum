// app/RR.HH/vacaciones/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { jsPDF } from "jspdf";
import { Database } from "../../../lib/database.types";
import { useRouter } from "next/navigation";

type Vacacion = Database["public"]["Tables"]["vacaciones"]["Row"];

export default function VacacionesPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("vacaciones")
      .select(`
        id,
        empleado_id,
        start_date,
        end_date,
        tipo,
        motivo
      `)
      .order("start_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setVacaciones(data);
        setLoading(false);
      });
  }, [supabase]);

  const exportCSV = () => {
    const header = ["ID","Empleado ID","Inicio","Fin","Tipo","Motivo","Empresa"];
    const rows = vacaciones.map(v => [
      v.id,
      v.empleado_id,
      v.start_date,
      v.end_date,
      v.tipo,
      v.motivo ?? "",
      "MiEmpresa S.L."    // ajusta aquí el nombre de tu empresa
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
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFontSize(18);
    doc.text("Resumen de Vacaciones", 40, 40);
    doc.setFontSize(12);
    doc.text(`Empresa: MiEmpresa S.L.`, 40, 60);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 400, 60);

    const startY = 90;
    const rowHeight = 20;
    // encabezados
    const cols = ["Empleado ID","Inicio","Fin","Tipo","Motivo"];
    cols.forEach((h, i) => {
      doc.text(h, 40 + i * 100, startY);
    });
    // filas
    vacaciones.forEach((v, idx) => {
      const y = startY + (idx + 1) * rowHeight;
      doc.text(v.empleado_id, 40, y);
      doc.text(v.start_date, 140, y);
      doc.text(v.end_date, 240, y);
      doc.text(v.tipo, 340, y);
      doc.text(v.motivo ?? "-", 440, y);
    });

    doc.save("vacaciones.pdf");
  };

  if (loading) {
    return <p className="p-6">Cargando...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
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
          <p className="text-xl font-semibold">Sin vacaciones</p>
          <p className="mt-2 text-gray-500">Todavía no hay solicitudes de vacaciones.</p>
          <Link href="/RR.HH/vacaciones/nuevo">
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Solicitar vacaciones
            </button>
          </Link>
          <p className="mt-8 text-sm">
            <Link
              href="https://docs.clientum.com/vacaciones"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Consulta la política de vacaciones
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex justify-end space-x-2">
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
                  <th className="px-4 py-2">Empleado ID</th>
                  <th className="px-4 py-2">Inicio</th>
                  <th className="px-4 py-2">Fin</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {vacaciones.map((v) => (
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
