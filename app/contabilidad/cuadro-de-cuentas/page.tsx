"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";

interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
  grupo: string;
  debe: number;
  haber: number;
  saldo: number;
}

export default function CuadroDeCuentasPage() {
  const router = useRouter();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Carga inicial de cuentas (ajusta tu endpoint)
  useEffect(() => {
    fetch(`/api/contabilidad/cuentas?desde=${fechaDesde}&hasta=${fechaHasta}`)
      .then((res) => res.json())
      .then((data) => setCuentas(data.cuentas || []));
  }, [fechaDesde, fechaHasta]);

  const mostrarCuentas = cuentas
    .filter((c) =>
      filter === "all" ? true : filter === "con-saldo" ? c.saldo !== 0 : true
    )
    .filter((c) =>
      search ? c.nombre.toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <div className="p-6">
      {/* Header y acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-semibold">Cuadro de cuentas</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push("/contabilidad/libro-diario/nuevo-asiento")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nuevo asiento
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="px-4 py-2 border rounded hover:bg-gray-50">
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
                    <Link
                      href="#"
                      className={`block px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                    >
                      CSV
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="#"
                      className={`block px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                    >
                      PDF
                    </Link>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          <select
            value={filter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFilter(e.target.value)
            }
            className="border rounded px-3 py-2"
          >
            <option value="all">Mostrar todas</option>
            <option value="con-saldo">Sólo con saldo</option>
          </select>
        </div>
      </div>

      {/* Filtros de búsqueda y fechas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar cuenta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      {/* Tabla de cuentas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2"><input type="checkbox" /></th>
              <th className="px-4 py-2">Cuenta</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2 text-right">Debe</th>
              <th className="px-4 py-2 text-right">Haber</th>
              <th className="px-4 py-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {mostrarCuentas.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-2">{c.codigo}</td>
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.grupo}</td>
                <td className="px-4 py-2 text-right">{c.debe.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{c.haber.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{c.saldo.toFixed(2)}</td>
              </tr>
            ))}
            {mostrarCuentas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay cuentas para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
