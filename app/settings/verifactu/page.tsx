"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function VerifactuSettingsPage() {
  const supabase = createClientComponentClient();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const SETTING_KEY = "verifactu_key";

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("account_settings")
        .select("value")
        .eq("key", SETTING_KEY)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching Verifactu key:", error);
      }
      if (data?.value) {
        setKey(data.value);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Upsert: crea o actualiza
    const { error } = await supabase
      .from("account_settings")
      .upsert({
        user_id: supabase.auth.user()?.id,
        key: SETTING_KEY,
        value: key.trim(),
      });
    if (error) {
      alert("Error guardando la clave: " + error.message);
    } else {
      alert("Clave de Verifactu guardada correctamente");
    }
    setSaving(false);
  };

  if (loading) return <p>Cargando ajuste de Verifactu…</p>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl mb-4">Ajustes de Verifactu</h1>
      <label className="block mb-2">
        Tu API Key de Verifactu
        <input
          type="text"
          className="mt-1 w-full border rounded px-3 py-2"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="pk_test_abcdef123456..."
        />
      </label>
      <button
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        onClick={handleSave}
        disabled={saving || key.trim() === ""}
      >
        {saving ? "Guardando…" : "Guardar clave"}
      </button>
    </div>
  );
}
