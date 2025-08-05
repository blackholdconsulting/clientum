// app/clientes/nuevo/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react';

export default function NuevoClientePage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const user = useUser();

  const [nombre, setNombre] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [codigoPostal, setCodigoPostal] = useState<number | ''>('');
  const [localidad, setLocalidad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [pais, setPais] = useState('');
  const [telefono, setTelefono] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para crear un cliente.');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('clientes')
      .insert({
        user_id: user.id,
        nombre,
        razon_social: razonSocial,
        nif,
        email,
        domicilio,
        codigo_postal: codigoPostal === '' ? null : codigoPostal,
        localidad,
        provincia,
        pais,
        telefono: telefono === '' ? null : telefono,
      });

    setLoading(false);

    if (error) {
      alert('Error creando cliente: ' + error.message);
    } else {
      // Al crear correctamente, volvemos a la lista de clientes
      router.push('/clientes');
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-semibold">Nuevo cliente</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          Nombre contacto
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Razón social
          <input
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          NIF / CIF
          <input
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Domicilio
          <input
            value={domicilio}
            onChange={(e) => setDomicilio(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Código postal
          <input
            type="number"
            value={codigoPostal}
            onChange={(e) => setCodigoPostal(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Localidad
          <input
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Provincia
          <input
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          País
          <input
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Teléfono
          <input
            type="number"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creando…' : 'Crear cliente'}
        </button>
      </form>
    </main>
  );
}
