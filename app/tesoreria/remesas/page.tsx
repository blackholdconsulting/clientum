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
    awa
