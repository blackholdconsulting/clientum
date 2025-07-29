// app/settings/verifactu/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const SETTING_KEY = "verifactu_key";

export default function VerifactuSettingsPage() {
  const supabase = createClientComponentClient();
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al montar, cargamos el valor actual de la clave
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("account_settings")
        .select("value")
        .eq("key", SETTING_KEY)
        .single();
      if (error && error.code !== "PGRST116") {
        setError("Error cargando la clave");
      } else if (data) {
        setKey(data.value);
      }
    })();
  }, []);

  // Guardar cambios
  const guardar = async () => {
    setError(null);
    setSaved(false);

    // Obtener el usuario actual
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session?.user.id) {
      setError("Debes iniciar sesión para guardar la clave");
      return;
    }
    const userId = session.user.id;

    const { error: upsertError } = await supabase
      .from("account_settings")
      .upsert({
        user_id: userId,
        key: SETTING_KEY,
        value: key.trim(),
      });

    if (upsertError) {
      setError("Error guardando la clave");
    } else {
      setSaved(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Ajustes Verifactu</h1>

      <label className="block">
        <span className="font-medium">Clave API de Verifactu</span>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
          placeholder="Introduce tu clave de Verifactu"
        />
      </label>

      {error && (
        <div className="text-red-600 font-medium">
          {error}
        </div>
      )}

      {saved && (
        <div className="text-green-600 font-medium">
          Clave guardada correctamente.
        </div>
      )}

      <button
        onClick={guardar}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Guardar
      </button>
    </div>
  );
}
