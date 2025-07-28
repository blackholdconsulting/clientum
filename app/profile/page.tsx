// app/profile/page.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    idioma: "Español",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    console.log("Guardando perfil:", form, photoFile);
    // aquí tu lógica de guardado…
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Perfil de usuario</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Guardar
            </button>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-8 space-y-6">
          {/* Foto */}
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-gray-200 rounded-full overflow-hidden">
              {previewUrl && (
                <img
                  src={previewUrl}
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
                onChange={handlePhoto}
                className="sr-only"
              />
            </label>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Idioma
              </label>
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

          {/* Secciones adicionales */}
          <div className="space-y-8">
            {/* Primeros pasos */}
            <div className="border-t pt-4">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <span className="mr-2">▶</span>PRIMEROS PASOS
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Visualiza u oculta la sección de primeros pasos para aprender a
                utilizar Clientum
              </p>
              <button className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
                Ocultar
              </button>
            </div>

            {/* Contraseña */}
            <div className="border-t pt-4">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <span className="mr-2">🔒</span>CONTRASEÑA
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Modifica la contraseña con la que accedes actualmente a tu
                cuenta en Clientum.
              </p>
              <button className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
                Crear contraseña
              </button>
            </div>

            {/* Verificación en dos pasos */}
            <div className="border-t pt-4">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <span className="mr-2">🛡️</span>VERIFICACIÓN EN DOS PASOS
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Aumenta la seguridad de tu cuenta con la verificación en dos
                pasos. Además de tu contraseña, necesitarás un código secreto
                enviado a tu móvil o email para acceder.
              </p>
              <button className="mt-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">
                Activar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
