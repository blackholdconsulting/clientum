// app/employees/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  salary: number;
}

export default function EmployeesPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")        // Sin genéricos
        .select("*");
      if (error) {
        console.error("Error cargando empleados:", error);
      } else if (data) {
        setEmployees(data as Employee[]);
      }
      setLoading(false);
    }
    loadEmployees();
  }, [supabase]);

  if (loading) return <p>Cargando empleados…</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Empleados</h1>
      <ul className="list-disc pl-5 space-y-1">
        {employees.map((e) => (
          <li key={e.id}>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => router.push(`/employees/${e.id}`)}
            >
              {e.first_name} {e.last_name} — {e.email}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
