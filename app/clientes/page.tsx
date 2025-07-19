// app/clientes/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface Cliente {
  id: string;
  user_id: string;
  nombre: string;
  email: string;
  nif: string;
  domicilio: string;
  razon_social: string;
  localidad: string;
  provincia: string;
  pais: string;
  telefono: number;
  codigo_postal: number;
}

export default function ClientesPage() {
  const supabase = createClientComponentClient();  // aquí
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*");
      if (error) {
        console.error("Error cargando clientes:", error);
      } else if (data) {
        setClientes(data as Cliente[]);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <p>Cargando clientes…</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <ul className="list-disc pl-5 space-y-1">
        {clientes.map((c) => (
          <li key={c.id}>
            <button
              className="text-blue-600 hover:underline"
              onClick={() => router.push(`/clientes/${c.id}`)}
            >
              {c.nombre} ({c.email})
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

