// app/admin/licenses/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface License {
  key: string;
  active: boolean;
}

export default function LicensesPage() {
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);

  // Carga inicial
  useEffect(() => {
    loadLicenses();
  }, []);

  async function loadLicenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("licenses")
      .select("*");
    if (error) {
      console.error("Error cargando licencias:", error);
    } else if (data) {
      setLicenses(data as License[]);
    }
    setLoading(false);
  }

  async function createLicense() {
    setLoading(true);
    const newKey = crypto.randomUUID().toUpperCase();

    // Aquí ya NO usamos .from<...>()
    const { data, error } = await supabase
      .from("licenses")
      .insert([{ key: newKey, active: false }]);
    if (error) {
      console.error("Error creando licencia:", error);
    } else if (data) {
      setLicenses(prev => [...prev, ...(data as License[])]);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={createLicense}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Creando…" : "Crear nueva licencia"}
      </button>
      <ul className="list-disc pl-5">
        {licenses.map(lic => (
          <li key={lic.key}>
            {lic.key} — {lic.active ? "Activa" : "Inactiva"}
          </li>
        ))}
      </ul>
    </div>
  );
}
