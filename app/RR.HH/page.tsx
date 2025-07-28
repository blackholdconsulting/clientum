// app/RR.HH/page.tsx
import Link from "next/link";
import { ReactNode } from "react";
import { FiUser, FiDollarSign, FiBookOpen, FiClock, FiUmbrella } from "react-icons/fi";

export default function RRHHPage() {
  const sections: { href: string; icon: ReactNode; title: string; description: string }[] = [
    {
      href: "/RR.HH/employees",
      icon: <FiUser className="text-2xl text-indigo-600" />,
      title: "Empleados",
      description: "Gestiona tu plantilla y datos de contacto",
    },
    {
      href: "/RR.HH/payroll",
      icon: <FiDollarSign className="text-2xl text-green-600" />,
      title: "Nóminas",
      description: "Genera y revisa las nóminas de tu equipo",
    },
    {
      href: "/RR.HH/gastos",
      icon: <FiBookOpen className="text-2xl text-yellow-600" />,
      title: "Gastos",
      description: "Registro y control de gastos de personal",
    },
    {
      href: "/RR.HH/horarios",
      icon: <FiClock className="text-2xl text-blue-600" />,
      title: "Horarios",
      description: "Configura los turnos y horarios laborales",
    },
    {
      href: "/RR.HH/vacaciones",
      icon: <FiUmbrella className="text-2xl text-pink-600" />,
      title: "Vacaciones",
      description: "Solicitudes y aprobaciones de vacaciones",
    },
  ];

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">RRHH</h1>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec) => (
          <div key={sec.href} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div className="flex items-center mb-4">
              {sec.icon}
              <h2 className="ml-3 text-xl font-medium">{sec.title}</h2>
            </div>
            <p className="flex-1 mb-4 text-gray-600">{sec.description}</p>
            <Link
              href={sec.href}
              className="mt-auto inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Ir a {sec.title}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
