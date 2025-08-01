"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";

interface Activo {
  id: string;
  nombre: string;
  codigo: string;
  grupo: string;
  valor: number;
  amortizacion: number;
  saldo: number;
}

export default function ActivosPage() {
  const router = useRouter();
  const [activos, setActivos] = useState<Activo[]>([]);
  const [filter, setFilter] = useState("all");

  // Carga de activos
  useEffect(() => {
    fetch(`/api/contabilidad/activos?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => setActivos(data.activos || []));
  }, [filter]);

  return (
    <div className="p-6">
      {/* Header con acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold">Activos</h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border rounded hover:bg-gray-100">
            Importar
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="px-4 py-2 border rounded hover:bg-gray-100">
              Exportar ▾
            </Menu.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`block w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                    >
                      CSV
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`block w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                    >
                      PDF
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* ESTE ES EL BOTÓN CONFIGURADO */}
          <button
            onClick={() => router.push("/contabilidad/activos/nuevo-activo")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nuevo activo
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Todos</option>
          <option value="grupo1">Grupo 1</option>
          <option value="grupo2">Grupo 2</option>
        </select>
      </div>

      {/* Tabla de activos */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Activo</th>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2 text-right">Valor</th>
              <th className="px-4 py-2 text-right">Amortización</th>
              <th className="px-4 py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {activos.length > 0 ? (
              activos.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{a.nombre}</td>
                  <td className="px-4 py-2">{a.codigo}</td>
                  <td className="px-4 py-2">{a.grupo}</td>
                  <td className="px-4 py-2 text-right">{a.valor.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{a.amortizacion.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{a.saldo.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No tienes activos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
