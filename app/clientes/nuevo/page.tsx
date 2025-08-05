// app/clientes/nuevo/page.tsx
'use client';

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [razonSocial, setRazonSocial] = useState("");
  const [nombre, setNombre] = useState("");
  const [nif, setNif] = useState("");
  const [email, setEmail] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [codigoPostal, setCodigoPostal] = useState<number | "">("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [pais, setPais] = useState("");
  const [telefono, setTelefono] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("Debes iniciar sesión para crear un cliente");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("clientes").insert({
      user_id: user.id,
      nombre,
      razon_social: razonSocial,
      nif,
      email,
      domicilio,
      codigo_postal: codigoPostal === "" ? null : codigoPostal,
      localidad,
      provincia,
      pais,
      telefono: telefono === "" ? null : telefono,
    });

    setLoading(false);
    if (error) {
      alert("Error creando cliente: " + error.message);
    } else {
      // <<< aquí la ruta en minúsculas
      router.push("/clientes");
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo Cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Razón social</label>
          <input
            required
            value={razonSocial}
            onChange={e => setRazonSocial(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Nombre contacto</label>
          <input
            required
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>NIF / CIF</label>
          <input
            required
            value={nif}
            onChange={e => setNif(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Domicilio fiscal</label>
          <input
            required
            value={domicilio}
            onChange={e => setDomicilio(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Código postal</label>
          <input
            type="number"
            required
            value={codigoPostal}
            onChange={e => setCodigoPostal(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Localidad</label>
          <input
            required
            value={localidad}
            onChange={e => setLocalidad(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Provincia</label>
          <input
            required
            value={provincia}
            onChange={e => setProvincia(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>País</label>
          <input
            required
            value={pais}
            onChange={e => setPais(e.target.value)}
            className="border w-full px-2 py-1"
          />
        </div>
        <div>
          <label>Teléfono</label>
          <input
            type="number"
            required
            value={telefono}
            onChange={e => setTelefono(e.target.value === "" ? "" : parseInt(e.target.value))}
            className="border w-full px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Creando…" : "Crear Cliente"}
        </button>
      </form>
    </main>
  );
}
