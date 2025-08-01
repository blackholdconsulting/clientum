"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Configuración Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Cuenta {
  id: number;
  nombre: string;
  saldo: number;
}

export default function TesoreriaPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [newCuenta, setNewCuenta] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Obtener usuario logueado
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      fetchCuentas(user.id);
    };
    getUser();
  }, []);

  // Cargar cuentas filtradas por user_id
  const fetchCuentas = async (uid: string) => {
    const { data, error } = await supabase
      .from("cuentas")
      .select("*")
      .eq("user_id", uid);

    if (error) {
      console.error("Error al cargar cuentas:", error);
    } else {
      setCuentas(data || []);
    }
  };

  // Crear nueva cuenta
  const addCuenta = async () => {
    if (!newCuenta || !userId) return;

    const { error } = await supabase.from("cuentas").insert([
      {
        nombre: newCuenta,
        saldo,
        user_id: userId,
      },
    ]);

    if (error) {
      console.error("Error al crear cuenta:", error);
    } else {
      setNewCuenta("");
      setSaldo(0);
      fetchCuentas(userId);
    }
  };

  // Eliminar cuenta (solo del usuario)
  const deleteCuenta = async (id: number) => {
    if (!userId) return;

    const { error } = await supabase
      .from("cuentas")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error al eliminar cuenta:", error);
    } else {
      fetchCuentas(userId);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tesorería</h1>

      {/* Formulario para crear cuenta */}
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="Nombre de la cuenta"
          value={newCuenta}
          onChange={(e) => setNewCuenta(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="number"
          placeholder="Saldo inicial"
          value={saldo}
          onChange={(e) => setSaldo(Number(e.target.value))}
          className="border rounded px-3 py-2 w-32"
        />
        <button
          onClick={addCuenta}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Añadir
        </button>
      </div>

      {/* Tabla de cuentas */}
      <div className="overflow-x-auto shadow border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Saldo</th>
              <th className="px-4 py-2 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((cuenta) => (
              <tr key={cuenta.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{cuenta.id}</td>
                <td className="px-4 py-2 border-b">{cuenta.nombre}</td>
                <td className="px-4 py-2 border-b">{cuenta.saldo} €</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => deleteCuenta(cuenta.id)}
                    className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
