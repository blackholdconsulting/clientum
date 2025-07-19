// app/clientes/[id]/ClientePage.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Layout from "../../../components/Layout";

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

export default function ClientePage({ id }: { id: string }) {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  // aquí van tus demás useState…

  useEffect(() => {
    async function fetchCliente() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setCliente(data);
      setLoading(false);
    }
    fetchCliente();
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // tu lógica de update…
    setLoading(false);
    router.push("/clientes");
  }

  async function handleDelete() {
    if (!confirm("¿Borrar cliente?")) return;
    setLoading(true);
    await supabase.from("clientes").delete().eq("id", id);
    router.push("/clientes");
  }

  return (
    <Layout>
      <main className="p-6">
        {loading ? (
          <p>Cargando…</p>
        ) : !cliente ? (
          <p>No encontrado.</p>
        ) : (
          <>
            <h1 className="text-2xl mb-4">{cliente.nombre}</h1>
            <form onSubmit={handleSubmit}>
              {/* …tus inputs aquí… */}
              <button type="submit">Guardar</button>
              <button type="button" onClick={handleDelete}>Borrar</button>
            </form>
          </>
        )}
      </main>
    </Layout>
  );
}
