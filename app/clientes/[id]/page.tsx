"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient"; // ← Ajusta si tu cliente está en otra carpeta
import Layout from "../../layout";

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

export default function ClientePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  // estados de formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [pais, setPais] = useState("");
  const [telefono, setTelefono] = useState(0);
  const [codigoPostal, setCodigoPostal] = useState(0);

  // carga inicial
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from<Cliente>("clientes")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) {
        console.error("Error cargando cliente:", error);
        return;
      }
      setCliente(data);
      // llenar formulario
      setNombre(data.nombre);
      setEmail(data.email);
      setNif(data.nif);
      setDomicilio(data.domicilio);
      setRazonSocial(data.razon_social);
      setLocalidad(data.localidad);
      setProvincia(data.provincia);
      setPais(data.pais);
      setTelefono(data.telefono);
      setCodigoPostal(data.codigo_postal);
      setLoading(false);
    }
    load();
  }, [params.id]);

  // envío del formulario de edición
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("clientes")
      .update({
        nombre,
        email,
        nif,
        domicilio,
        razon_social: razonSocial,
        localidad,
        provincia,
        pais,
        telefono,
        codigo_postal: codigoPostal,
      })
      .eq("id", params.id);
    if (error) {
      console.error("Error actualizando cliente:", error);
    } else {
      router.push("/Clientes");
    }
    setLoading(false);
  }

  // borrar cliente
  async function handleDelete() {
    if (!confirm("¿Seguro quieres borrar este cliente?")) return;
    setLoading(true);
    await supabase.from("clientes").delete().eq("id", params.id);
    router.push("/Clientes");
  }

  return (
    <Layout>
      <main className="p-6">
        {loading ? (
          <p>Cargando cliente…</p>
        ) : !cliente ? (
          <p>Cliente no encontrado.</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Editar Cliente</h1>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
              <div>
                <label>Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>NIF</label>
                <input
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>Domicilio</label>
                <input
                  value={domicilio}
                  onChange={(e) => setDomicilio(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>Razón social</label>
                <input
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>Localidad</label>
                <input
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>Provincia</label>
                <input
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>País</label>
                <input
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full border px-2 py-1"
                  required
                />
              </div>
              <div>
                <label>Teléfono</label>
                <input
                  type="number"
                  value={telefono}
                  onChange={(e) => setTelefono(+e.target.value)}
                  className="w-full border px-2 py-1"
                />
              </div>
              <div>
                <label>Código Postal</label>
                <input
                  type="number"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(+e.target.value)}
                  className="w-full border px-2 py-1"
                />
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {loading ? "Guardando…" : "Guardar Cambios"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/Clientes")}
                  className="px-4 py-2 border rounded"
                >
                  Volver
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </Layout>
  );
}
