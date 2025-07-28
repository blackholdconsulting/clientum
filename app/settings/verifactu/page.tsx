"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function VerifactuSettingsPage() {
  const supabase = createClientComponentClient();
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Cargar al montar
  useEffect(() => {
    (async () => {
      const {
        data: [{ value } = { value: "" }],
      } = await supabase
        .from("account_settings")
        .select("value")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("key", "VERIFACTU_KEY")
        .limit(1);
      setKey(value);
    })();
  }, [supabase]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    const { error } = await supabase
      .from("account_settings")
      .upsert({ user_id: userId, key: "VERIFACTU_KEY", value: key });
    if (error) setMessage("Error: " + error.message);
    else setMessage("Clave guardada correctamente");
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ajustes Verifactu</h1>
      <form onSubmit={save} className="space-y-4">
        <label className="block">
          <span className="font-medium">API Key</span>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk_..."
            className="mt-1 block w-full rounded border px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </main>
  );
}
