"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient"; // ← Ajusta ruta

export default function NewClientPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [nif, setNif] = useState("");
  const [domicilio, setDomicilio] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [pais, setPais] = useState("");
  const [telefono, setTelefono] = useState<number | undefined>(undefined);
  const [codigoPostal, setCodigoPostal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      alert("Debes iniciar sesión para crear un cliente");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("clientes").insert([
      {
        user_id: user.id,
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
      },
    ]);

    setLoading(false);
    if (error) {
      alert("Error creando cliente");
      console.error(error);
    } else {
      router.push("/Clientes");
    }
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Nuevo Cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><label>Razón social</label><input required value={razonSocial} onChange={e=>setRazonSocial(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>Nombre contacto</label><input required value={nombre} onChange={e=>setNombre(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>NIF / CIF</label><input required value={nif} onChange={e=>setNif(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>Domicilio fiscal</label><input required value={domicilio} onChange={e=>setDomicilio(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>Código postal</label><input type="number" required value={codigoPostal??""} onChange={e=>setCodigoPostal(parseInt(e.target.value))} className="border w-full px-2 py-1"/></div>
        <div><label>Localidad</label><input required value={localidad} onChange={e=>setLocalidad(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>Provincia</label><input required value={provincia} onChange={e=>setProvincia(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>País</label><input required value={pais} onChange={e=>setPais(e.target.value)} className="border w-full px-2 py-1"/></div>
        <div><label>Teléfono</label><input type="number" required value={telefono??""} onChange={e=>setTelefono(parseInt(e.target.value))} className="border w-full px-2 py-1"/></div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
          {loading ? "Creando…" : "Crear Cliente"}
        </button>
      </form>
    </main>
  );
}
