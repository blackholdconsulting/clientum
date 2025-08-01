"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PagoCobro {
  id: number;
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
}

export default function PagosCobrosPage() {
  const [items, setItems] = useState<PagoCobro[]>([]);
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState(0);
  const [tipo, setTipo] = useState("pago");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchItems(user.id);
      }
    };
    loadUser();
  }, []);

  const fetchItems = async (uid: string) => {
    const { data } = await supabase
      .from("movimientos")
      .select("*")
      .eq("user_id", uid)
      .in("tipo", ["pago", "cobro"]);
    setItems(data || []);
  };

  const addItem = async () => {
    if (!userId) return;
    await supabase.from("movimientos").insert([{ concepto, monto, tipo, user_id: userId }]);
    setConcepto("");
    setMonto(0);
    fetchItems(userId);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pagos y Cobros</h1>
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
          <option value="pago">Pago</option>
          <option value="cobro">Cobro</option>
        </select>
        <button onClick={addItem} className="px-3 py-1 bg-blue-600 text-white rounded">
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
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border px-3 py-2">{new Date(item.fecha).toLocaleDateString()}</td>
              <td className="border px-3 py-2">{item.tipo}</td>
              <td className="border px-3 py-2">{item.concepto}</td>
              <td className="border px-3 py-2">{item.mo
