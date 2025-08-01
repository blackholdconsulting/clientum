"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Movimiento {
  id: number;
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
}

export default function CashflowPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState(0);
  const [tipo, setTipo] = useState("ingreso");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchMovimientos(user.id);
      }
    };
    loadUser();
  }, []);

  const fetchMovimientos = async (uid: string) => {
    const { data } = await supabase.from("movimientos").select("*").eq("user_id", uid);
    setMovimientos(data || []);
  };

  const addMovimiento = async () => {
    if (!userId) return;
    await supabase.from("movimientos").insert([{ concepto, monto, tipo, user_id: userId }]);
    setConcepto("");
    setMonto(0);
    fetchMovimientos(userId);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Cashflow</h1>
      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="Concepto"
          className="border px-2 py-1 rounded"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />
        <input
          type="number"
          placeholder="Monto"
          className="border px-2 py-1 rounded"
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
        />
        <select
          className="border px-2 py-1 rounded"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="ingreso">Ingreso</option>
          <option value="gasto">Gasto</option>
        </select>
        <button onClick={addMovimiento} className="px-3 py-1 bg-blue-600 text-white rounded">
          Añadir
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-3 py-2">Fecha</th>
            <th className="border px-3 py-2">Tipo</th>
            <th className="border px-3 py-2">Concepto</th>
            <th className="border px-3 py-2">Monto</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td className="border px-3 py-2">{new Date(m.fecha).toLocaleDateString()}</td>
              <td className="border px-3 py-2">{m.tipo}</td>
              <td className="border px-3 py-2">{m.concepto}</td>
              <td className="border px-3 py-2">{m.monto} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
