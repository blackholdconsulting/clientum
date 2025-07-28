// app/RR.HH/vacaciones/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { jsPDF } from "jspdf";
import { Database } from "../../../lib/database.types";

type Vacacion = Database["public"]["Tables"]["vacaciones"]["Row"];

export default function VacacionesPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);
  const empresa = "MiEmpresa S.L."; // Cambia por tu nombre de empresa

  useEffect(() => {
    supabase
      .from("vacaciones")
      .select("*")
      .order("start_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else if (data) setVacaciones(data);
        setLoading(false);
      });
  }, [supabase]);

  // Export CSV
  const exportCSV = () => {
    const header = ["Empleado ID","Inicio","Fin","Tipo","Motivo","Empresa"];
    const rows = vacaciones.map(v => [
      v.empleado_id,
      v.start_date,
      v.end_date,
      v.tipo,
      v.motivo ?? "",
      empresa
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vacaciones.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const marginLeft = 40;
    let y = 40;

    doc.setFontSize(18);
    doc.text("Resumen de Vacaciones", marginLeft, y);
    y += 24;
    doc.setFontSize(12);
    doc.text(`Empresa: ${empresa}`, marginLeft, y);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 400, y);
    y += 30;

    // Encabezados
    const cols = ["Empleado ID","Inicio","Fin","Tipo","Motivo"];
    cols.forEach((h, i) => {
      doc.text(h, marginLeft + i * 100, y);
    });
    y += 16;
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, marginLeft + cols.length * 100 - 20, y);
    y += 10;

    // Filas
    vacaciones.forEach(v => {
      doc.text(v.empleado_id, marginLeft, y);
      doc.text(v.start_date, marginLeft + 100, y);
      doc.text(v.end_date, marginLeft + 200, y);
      doc.text(v.tipo, marginLeft + 300, y);
      doc.text(v.motivo ?? "-", marginLeft + 400, y);
      y += 20;
      if (y > 720) {
        doc.addPage();
        y = 40;
      }
    });

    // Espacio para firmas
    y += 40;
    doc.text("Firma empleado: ____________________", marginLeft, y);
    y += 30;
    doc.text("Firma empresa: ____________________", marginLeft, y);

    doc.save("vacaciones.pdf");
  };

  if (loading) {
    return <p className="p-6">Cargando...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-800"
          >
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

      {/* Empty state */}
      {vacaciones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded shadow">
          <p className="text-xl font-semibold">Sin vacaciones</p>
          <p className="mt-2 text-gray-500">
            Todavía no hay solicitudes de vacaciones.
          </p>
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
          {/* Export buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Exportar CSV
            </button>
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Generar PDF
            </button>
          </div>
          {/* Table */}
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
