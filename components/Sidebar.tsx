"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";

export default function Sidebar() {
  // aquí defines un estado por cada dropdown:
  const [openFacturas, setOpenFacturas] = useState(false);
  const [openNegocio, setOpenNegocio] = useState(false);
  const [openTesoreria, setOpenTesoreria] = useState(false);
  const [openContabilidad, setOpenContabilidad] = useState(false);
  const [openRRHH, setOpenRRHH] = useState(false);

  // función genérica para cerrar cuando clicas fuera
  function useClickOutside(ref: React.RefObject<HTMLDivElement>, onClose: () => void) {
    useEffect(() => {
      function handler(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          onClose();
        }
      }
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [ref, onClose]);
  }

  // refs para cada dropdown
  const refFacturas = useRef<HTMLDivElement>(null);
  const refNegocio = useRef<HTMLDivElement>(null);
  const refTesoreria = useRef<HTMLDivElement>(null);
  const refContab = useRef<HTMLDivElement>(null);
  const refRRHH = useRef<HTMLDivElement>(null);

  useClickOutside(refFacturas, () => setOpenFacturas(false));
  useClickOutside(refNegocio, () => setOpenNegocio(false));
  useClickOutside(refTesoreria, () => setOpenTesoreria(false));
  useClickOutside(refContab, () => setOpenContabilidad(false));
  useClickOutside(refRRHH, () => setOpenRRHH(false));

  return (
    <aside className="w-64 bg-white border-r shadow-md flex flex-col">
      <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
      <nav className="flex-1 flex flex-col px-4 text-sm space-y-1 overflow-y-auto">
        <Link href="/dashboard">
          <a className="py-2 px-3 rounded hover:bg-indigo-100">📊 Dashboard</a>
        </Link>
        <Link href="/clientes">
          <a className="py-2 px-3 rounded hover:bg-indigo-100">👥 Clientes</a>
        </Link>

        {/* Facturas con subpágina histórico */}
        <div className="relative" ref={refFacturas}>
          <button
            onClick={() => setOpenFacturas((v) => !v)}
            className="w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100"
          >
            🧾 Facturas
            <span className={`${openFacturas ? "rotate-180" : ""} ml-1 text-xs transition-transform`}>▼</span>
          </button>
          {openFacturas && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow z-20">
              <Link href="/facturas">
                <a className="block py-2 px-3 hover:bg-indigo-50">Listado</a>
              </Link>
              <Link href="/facturas/historico">
                <a className="block py-2 px-3 hover:bg-indigo-50">Histórico</a>
              </Link>
            </div>
          )}
        </div>

        <Link href="/presupuestos">
          <a className="py-2 px-3 rounded hover:bg-indigo-100">💼 Presupuestos</a>
        </Link>

        {/* Negocio */}
        <div className="relative" ref={refNegocio}>
          <button
            onClick={() => setOpenNegocio((v) => !v)}
            className="w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100"
          >
            🚀 Negocio
            <span className={`${openNegocio ? "rotate-180" : ""} ml-1 text-xs transition-transform`}>▼</span>
          </button>
          {openNegocio && (
            <div className="absolute left-full top-0 ml-2 w-52 bg-white border rounded shadow z-20">
              <Link href="/negocio/tareas"><a className="block py-2 px-3 hover:bg-indigo-50">Mis tareas</a></Link>
              <Link href="/negocio/proyectos"><a className="block py-2 px-3 hover:bg-indigo-50">Proyectos</a></Link>
              <Link href="/negocio/plan-futuro"><a className="block py-2 px-3 hover:bg-indigo-50">Plan futuro</a></Link>
              <Link href="/negocio/estudio-mercado"><a className="block py-2 px-3 hover:bg-indigo-50">Estudio de mercado</a></Link>
              <Link href="/negocio/analisis-competencia"><a className="block py-2 px-3 hover:bg-indigo-50">Análisis competencia</a></Link>
              <Link href="/negocio/continuar-proyecto"><a className="block py-2 px-3 hover:bg-indigo-50">Continuar proyecto</a></Link>
            </div>
          )}
        </div>

        <Link href="/impuestos">
          <a className="py-2 px-3 rounded hover:bg-indigo-100">⚖️ Impuestos</a>
        </Link>

        {/* Tesorería */}
        <div className="relative" ref={refTesoreria}>
          <button
            onClick={() => setOpenTesoreria((v) => !v)}
            className="w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100"
          >
            🏦 Tesorería
            <span className={`${openTesoreria ? "rotate-180" : ""} ml-1 text-xs transition-transform`}>▼</span>
          </button>
          {openTesoreria && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow z-20">
              <Link href="/tesoreria/cuentas"><a className="block py-2 px-3 hover:bg-indigo-50">Cuentas</a></Link>
              <Link href="/tesoreria/cashflow"><a className="block py-2 px-3 hover:bg-indigo-50">Cashflow</a></Link>
              <Link href="/tesoreria/pagos-cobros"><a className="block py-2 px-3 hover:bg-indigo-50">Pagos y cobros</a></Link>
              <Link href="/tesoreria/remesas"><a className="block py-2 px-3 hover:bg-indigo-50">Remesas</a></Link>
            </div>
          )}
        </div>

        {/* Contabilidad */}
        <div className="relative" ref={refContab}>
          <button
            onClick={() => setOpenContabilidad((v) => !v)}
            className="w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100"
          >
            📈 Contabilidad
            <span className={`${openContabilidad ? "rotate-180" : ""} ml-1 text-xs transition-transform`}>▼</span>
          </button>
          {openContabilidad && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-white border rounded shadow z-20">
              <Link href="/contabilidad/cuadro-de-cuentas"><a className="block py-2 px-3 hover:bg-indigo-50">Cuadro de cuentas</a></Link>
              <Link href="/contabilidad/libro-diario"><a className="block py-2 px-3 hover:bg-indigo-50">Libro diario</a></Link>
              <Link href="/contabilidad/activos"><a className="block py-2 px-3 hover:bg-indigo-50">Activos</a></Link>
              <Link href="/contabilidad/perdidas-ganancias"><a className="block py-2 px-3 hover:bg-indigo-50">Pérdidas y ganancias</a></Link>
              <Link href="/contabilidad/balance-situacion"><a className="block py-2 px-3 hover:bg-indigo-50">Balance de situación</a></Link>
            </div>
          )}
        </div>

        <Link href="/chat"><a className="py-2 px-3 rounded hover:bg-indigo-100">💬 Chat IA</a></Link>

        {/* RRHH */}
        <div className="relative" ref={refRRHH}>
          <button
            onClick={() => setOpenRRHH((v) => !v)}
            className="w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100"
          >
            👩‍💼 RRHH
            <span className={`${openRRHH ? "rotate-180" : ""} ml-1 text-xs transition-transform`}>▼</span>
          </button>
          {openRRHH && (
            <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow z-20">
              <Link href="/RR.HH/employees"><a className="block py-2 px-3 hover:bg-indigo-50">Empleados</a></Link>
              <Link href="/RR.HH/nominas"><a className="block py-2 px-3 hover:bg-indigo-50">Nóminas</a></Link>
              <Link href="/RR.HH/gastos"><a className="block py-2 px-3 hover:bg-indigo-50">Gastos</a></Link>
              <Link href="/RR.HH/horarios"><a className="block py-2 px-3 hover:bg-indigo-50">Horarios</a></Link>
              <Link href="/RR.HH/vacaciones"><a className="block py-2 px-3 hover:bg-indigo-50">Vacaciones</a></Link>
            </div>
          )}
        </div>
      </nav>

      {/* Ayuda y soporte */}
      <div className="px-4 mt-auto border-t pt-2">
        <div className="text-xs font-semibold mb-1">Ayuda y soporte</div>
        <Link href="/help/academia"><a className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded">📘 Academia Clientum</a></Link>
        <Link href="/help/tutoriales"><a className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded">🎥 Tutoriales</a></Link>
        <Link href="/help/votar-mejoras"><a className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded">👍 Votar mejoras</a></Link>
        <Link href="/help/novedades"><a className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded">🆕 Novedades</a></Link>
        <Link href="/help/soporte"><a className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded">🛠️ Soporte</a></Link>
        <Link href="/help/contacto"><a className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded">💬 Contáctanos</a></Link>
        <Link href="/profile">
          <a className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded mt-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
            Mi cuenta
          </a>
        </Link>
        <UserMenu />
      </div>
    </aside>
  );
}
