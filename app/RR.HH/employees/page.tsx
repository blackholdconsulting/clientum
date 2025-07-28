// app/RR.HH/employees/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../../../lib/database.types";

type Employee = Database["public"]["Tables"]["empleados"]["Row"];

export default function EmployeesPage() {
  const supabase = createClientComponentClient<Database>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching empleados:", error);
      } else {
        setEmployees(data);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <Link href="/RR.HH/employees/nuevo">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            + Añadir empleado
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Apellidos</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">Salario</th>
                <th className="px-4 py-2 text-left">Fecha alta</th>
                <th className="px-4 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-2">{e.first_name}</td>
                  <td className="px-4 py-2">{e.last_name}</td>
                  <td className="px-4 py-2">{e.email}</td>
                  <td className="px-4 py-2">{e.position}</td>
                  <td className="px-4 py-2">{e.salary}</td>
                  <td className="px-4 py-2">{e.hired_at}</td>
                  <td className="px-4 py-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
