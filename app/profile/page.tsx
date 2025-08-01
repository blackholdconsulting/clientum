"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PerfilForm {
  // Datos personales
  nombre: string;
  apellidos: string;
  telefono: string;
  idioma: string;
  // Datos empresa / remitente
  nombre_empresa: string;
  nif: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  cp: string;
  pais: string;
  email: string;
  web: string;
  // Firma electrónica en Base64
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

  // Al montar, carga perfil existente
  useEffect(() => {
    async function fetchPerfil() {
      const res = await fetch("/api/usuario/perfil");
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
        if (data.perfil.firma) {
          setPreviewFirma(data.perfil.firma);
        }
      }
    }
    fetchPerfil();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setPreviewAvatar(url);
    // Aquí podrías enviar avatar a un endpoint aparte si lo necesitas
  };

  const handleFirma = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setForm(f => ({ ...f, firma: base64 }));
      setPreviewFirma(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/usuario/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      alert("Perfil guardado ✅");
      router.refresh();
    } else {
      alert("Error al guardar el perfil ❌");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
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
              {previewAvatar && (
                <img
                  src={previewAvatar}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
              Subir foto
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="sr-only"
              />
            </label>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
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

          {/* Datos de la Empresa (Remitente) */}
          <h3 className="text-md font-semibold mt-4">Datos de la Empresa (Remitente)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
              <input
                type="text"
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NIF / CIF</label>
              <input
                type="text"
                name="nif"
                value={form.nif}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Provincia</label>
              <input
                type="text"
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Código Postal</label>
              <input
                type="text"
                name="cp"
                value={form.cp}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">País</label>
              <input
                type="text"
                name="pais"
                value={form.pais}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Web</label>
              <input
                type="text"
                name="web"
                value={form.web}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Firma electrónica */}
          <h3 className="text-md font-semibold mt-4">Firma electrónica</h3>
          <div className="flex items-start space-x-6">
            <div className="h-24 w-48 bg-gray-100 rounded overflow-hidden border">
              {previewFirma ? (
                <img
                  src={previewFirma}
                  alt="Firma preview"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="block text-gray-400 text-center mt-8">
                  Sin firma
                </span>
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
              Subir firma
              <input
                type="file"
                accept="image/*"
                onChange={handleFirma}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
