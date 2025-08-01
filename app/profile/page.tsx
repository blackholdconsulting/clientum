"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PerfilForm {
  nombre: string;
  apellidos: string;
  telefono: string;
  idioma: string;
  nombre_empresa: string;
  nif: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  cp: string;
  pais: string;
  email: string;
  web: string;
  firma: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<PerfilForm>({
    nombre: "",
    apellidos: "",
    telefono: "",
    idioma: "Español",
    nombre_empresa: "",
    nif: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    cp: "",
    pais: "España",
    email: "",
    web: "",
    firma: "",
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewFirma, setPreviewFirma] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Al montar, carga perfil
  useEffect(() => {
    fetch("/api/usuario/perfil")
      .then(async (res) => {
        const data = await res.json();
        if (data.success && data.perfil) {
          setForm({
            nombre: data.perfil.nombre || "",
            apellidos: data.perfil.apellidos || "",
            telefono: data.perfil.telefono || "",
            idioma: data.perfil.idioma || "Español",
            nombre_empresa: data.perfil.nombre_empresa || "",
            nif: data.perfil.nif || "",
            direccion: data.perfil.direccion || "",
            ciudad: data.perfil.ciudad || "",
            provincia: data.perfil.provincia || "",
            cp: data.perfil.cp || "",
            pais: data.perfil.pais || "España",
            email: data.perfil.email || "",
            web: data.perfil.web || "",
            firma: data.perfil.firma || "",
          });
          if (data.perfil.firma) setPreviewFirma(data.perfil.firma);
        } else {
          console.error("GET /perfil error:", data.error);
          alert("No se pudo cargar el perfil: " + data.error);
        }
      })
      .catch((err) => {
        console.error("Fetch perfil failed:", err);
        alert("Error de red al cargar perfil");
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPreviewAvatar(URL.createObjectURL(e.target.files[0]));
  };

  const handleFirma = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setForm((f) => ({ ...f, firma: base64 }));
      setPreviewFirma(base64);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        console.error("POST /perfil error:", data.error);
        throw new Error(data.error || "Error desconocido");
      }
      alert("Perfil guardado ✅");
      router.refresh();
    } catch (err: any) {
      console.error("Guardar perfil failed:", err);
      alert("Fallo guardando perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Perfil de usuario</h2>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
        <div className="px-6 py-8 space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-gray-200 rounded-full overflow-hidden">
              {previewAvatar && <img src={previewAvatar} className="h-full w-full object-cover" alt="Avatar" />}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
              Subir foto
              <input type="file" accept="image/*" onChange={handleAvatar} className="sr-only" />
            </label>
          </div>
          {/* Datos Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Idioma</label>
              <select
                name="idioma"
                value={form.idioma}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option>Español</option>
                <option>Inglés</option>
                <option>Francés</option>
                <option>Alemán</option>
              </select>
            </div>
          </div>
          {/* Remitente */}
          <h3 className="text-md font-semibold">Datos de la Empresa (Remitente)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input
              name="nombre_empresa"
              placeholder="Nombre / Razón Social"
              value={form.nombre_empresa}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="nif"
              placeholder="NIF / CIF"
              value={form.nif}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="direccion"
              placeholder="Dirección"
              value={form.direccion}
              onChange={handleChange}
              className="sm:col-span-2 block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="ciudad"
              placeholder="Ciudad"
              value={form.ciudad}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="provincia"
              placeholder="Provincia"
              value={form.provincia}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="cp"
              placeholder="Código Postal"
              value={form.cp}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="pais"
              placeholder="País"
              value={form.pais}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
            <input
              name="web"
              placeholder="Web"
              value={form.web}
              onChange={handleChange}
              className="block w-full mt-1 border rounded px-3 py-2"
            />
          </div>
          {/* Firma */}
          <h3 className="text-md font-semibold mt-6">Firma Electrónica</h3>
          <div className="flex items-start space-x-6">
            <div className="h-24 w-48 bg-gray-100 rounded overflow-hidden border">
              {previewFirma ? (
                <img src={previewFirma} className="h-full w-full object-contain p-2" alt="Firma" />
              ) : (
                <span className="block text-gray-400 text-center mt-8">Sin firma</span>
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
              Subir firma
              <input type="file" accept="image/*" onChange={handleFirma} className="sr-only" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
