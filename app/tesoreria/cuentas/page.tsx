"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Cuenta {
  id: number;
  nombre: string;
  saldo: number;
}

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchCuentas(user.id);
      }
    };
    loadUser();
  }, []);

  const fetchCuentas = async (uid: string) => {
    const { data } = await supabase.from("cuentas").select("*").eq("user_id", uid);
    setCuentas(data || []);
  };

  const addCuenta = async () => {
    if (!userId) return;
    await supabase.from("cuentas").insert([{ nombre, saldo, user_id: userId }]);
    setNombre("");
    setSaldo(0);
    fetchCuentas(userId);
  };

  const deleteCuenta = async (id: number) => {
    if (!userId) return;
    await supabase.from("cuentas").delete().eq("id", id).eq("user_id", userId);
    fetchCuentas(userId);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Cuentas</h1>
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="Nombre de cuenta"
          className="border px-2 py-1 rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Saldo"
          className="border px-2 py-1 rounded"
          value={saldo}
          onChange={(e) => setSaldo(Number(e.target.value))}
        />
        <button onClick={addCuenta} className="px-3 py-1 bg-green-600 text-white rounded">
          Añadir
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Saldo</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuentas.map((c) => (
            <tr key={c.id}>
              <td className="border px-3 py-2">{c.id}</td>
              <td className="border px-3 py-2">{c.nombre}</td>
              <td className="border px-3 py-2">{c.saldo} €</td>
              <td className="border px-3 py-2">
                <button onClick={() => deleteCuenta(c.id)} className="px-2 py-1 bg-red-600 text-white rounded">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
