"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function FacturaeSettingsPage() {
  const supabase = createClientComponentClient();
  const [cert, setCert] = useState("");
  const [key, setKey] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id!;
      const { data } = await supabase
        .from("account_settings")
        .select("key,value")
        .eq("user_id", userId)
        .in("key", ["FACTURAE_CERT", "FACTURAE_KEY"]);
      data?.forEach((row) => {
        if (row.key === "FACTURAE_CERT") setCert(row.value);
        if (row.key === "FACTURAE_KEY") setKey(row.value);
      });
    })();
  }, [supabase]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    const updates = [
      { user_id: userId, key: "FACTURAE_CERT", value: cert },
      { user_id: userId, key: "FACTURAE_KEY", value: key },
    ];
    const { error } = await supabase.from("account_settings").upsert(updates);
    setMessage(error ? "Error: " + error.message : "Datos guardados correctamente");
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ajustes Facturae</h1>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Certificado (PEM)</label>
          <textarea
            value={cert}
            onChange={(e) => setCert(e.target.value)}
            className="w-full border rounded px-3 py-2 h-40 font-mono text-sm"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Clave privada (PEM)</label>
          <textarea
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full border rounded px-3 py-2 h-40 font-mono text-sm"
            required
          />
        </div>
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
