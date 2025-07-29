"use client";

import Link from "next/link";
import { ChartPieIcon, CurrencyEuroIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function NOPDashboard() {
  const cards = [
    {
      id: "budget",
      title: "Budget",
      description: "Gestiona el presupuesto global de tu empresa.",
      icon: <CurrencyEuroIcon className="w-8 h-8 text-blue-600" />,
      href: "/NOP/budget",
    },
    {
      id: "opex",
      title: "OPEX",
      description: "Controla los gastos operativos del día a día.",
      icon: <ChartPieIcon className="w-8 h-8 text-green-600" />,
      href: "/NOP/opex",
    },
    {
      id: "capex",
      title: "CAPEX",
      description: "Administra tus inversiones a largo plazo.",
      icon: <BuildingOffice2Icon className="w-8 h-8 text-purple-600" />,
      href: "/NOP/capex",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">NOP Dashboard</h1>
      <p className="text-gray-700 mb-6">
        Desde aquí puedes acceder y gestionar el presupuesto global, los gastos operativos (OPEX) y de capital (CAPEX) de tu empresa.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center"
          >
            <div className="mb-4">{card.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
