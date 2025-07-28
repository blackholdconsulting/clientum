// app/settings/verifactu/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function VerifactuSettingsPage() {
  const supabase = createClientComponentClient();
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: rows,
        error,
      } = await supabase
        .from("account_settings")
        .select("value")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("key", "VERIFACTU_KEY");
      if (error) {
        console.error(error);
        return;
      }
      // rows might be null or an array
      if (Array.isArray(rows) && rows.length > 0) {
        setKey(rows[0].value);
      }
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
        <div>
          <label className="block font-medium mb-1">API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="sk_..."
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar
        </button>
        {message && <p className="text-green-600">{message}</p>}
      </form>
    </main>
  );
}
