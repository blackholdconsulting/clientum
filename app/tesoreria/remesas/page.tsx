"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Remesa {
  id: number;
  concepto: string;
  monto: number;
  fecha: string;
}

export default function RemesasPage() {
  const [remesas, setRemesas] = useState<Remesa[]>([]);
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchRemesas(user.id);
      }
    };
    loadUser();
  }, []);

  const fetchRemesas = async (uid: string) => {
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .eq("user_id", uid)
      .eq("tipo", "remesa");
    setRemesas(data || []);
  };

  const addRemesa = async () => {
    if (!userId) return;
    await supabase.from("movimientos").insert([{ concepto, monto, tipo: "remesa", user_id: userId }]);
    setConcepto("");
    setMonto(0);
    fetchRemesas(userId);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Remesas</h1>
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
        <button onClick={addRemesa} className="px-3 py-1 bg-purple-600 text-white rounded">
          Añadir
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-3 py-2">Fecha</th>
            <th className="border px-3 py-2">Concepto</th>
            <th className="border px-3 py-2">Monto</th>
          </tr>
        </thead>
        <tbody>
          {remesas.map((r) => (
            <tr key={r.id}>
              <td className="border px-3 py-2">{new Date(r.fecha).toLocaleDateString()}</td>
              <td className="border px-3 py-2">{r.concepto}</td>
              <td className="border px-3 py-2">{r.monto} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
