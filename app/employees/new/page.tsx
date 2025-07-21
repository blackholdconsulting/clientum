"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function NewEmployeePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState<number | "">("");
  const [hiredAt, setHiredAt] = useState("");
  const [status, setStatus] = useState<"activo" | "inactivo">("activo");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("employees")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        position,
        salary: salary as number,
        hired_at: hiredAt,
        status,
      });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      // una vez insertado, recarga la lista
      router.push("/employees");
    }
  };

  return (
    <section className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">+ Nuevo Empleado</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <p className="text-red-600 bg-red-100 p-2 rounded">{errorMsg}</p>
        )}
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Apellidos</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Puesto</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Salario (€)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha de alta</label>
          <input
            type="date"
            value={hiredAt}
            onChange={(e) => setHiredAt(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "activo" | "inactivo")
            }
            className="mt-1 w-full border rounded px-2 py-1"
          >
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <Link
            href="/employees"
            className="text-gray-600 hover:underline"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Guardar Empleado"}
          </button>
        </div>
      </form>
    </section>
  );
}
