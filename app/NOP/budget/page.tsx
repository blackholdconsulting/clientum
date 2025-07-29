"use client";

import { useEffect, useState } from "react";

interface BudgetItem {
  id?: string;
  categoria: string;
  mes: number;
  gasto: number;
  presupuesto: number;
}

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [categorias, setCategorias] = useState<string[]>(["Marketing", "Sueldos", "Alquiler"]);

  useEffect(() => {
    fetch("/api/budget-monthly")
      .then((res) => res.json())
      .then((data) => setBudget(data));
  }, []);

  const handleChange = (cat: string, mes: number, field: "gasto" | "presupuesto", value: number) => {
    setBudget((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((b) => b.categoria === cat && b.mes === mes);
      if (index >= 0) {
        updated[index] = { ...updated[index], [field]: value };
      } else {
        updated.push({ categoria: cat, mes, gasto: 0, presupuesto: 0, [field]: value });
      }
      return updated;
    });
  };

  const saveBudget = async () => {
    await fetch("/api/budget-monthly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budget),
    });
    alert("Budget guardado correctamente");
  };

  const getTotal = (cat: string, field: "gasto" | "presupuesto") => {
    return budget
      .filter((b) => b.categoria === cat)
      .reduce((acc, curr) => acc + Number(curr[field] || 0), 0);
  };

  return (
    <div className="p-6 overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Budget Anual</h1>
      <table className="min-w-full bg-white shadow rounded-lg text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4">Categoría</th>
            {meses.map((m) => (
              <th key={m} className="py-2 px-4 text-center">{m}</th>
            ))}
            <th className="py-2 px-4 text-center">Total Gasto</th>
            <th className="py-2 px-4 text-center">Total Presupuesto</th>
            <th className="py-2 px-4 text-center">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat} className="border-b">
              <td className="py-2 px-4 font-semibold">{cat}</td>
              {meses.map((_, idx) => {
                const item = budget.find((b) => b.categoria === cat && b.mes === idx + 1);
                return (
                  <td key={idx} className="py-2 px-1">
                    <div className="flex flex-col gap-1">
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-xs"
                        placeholder="Gasto"
                        value={item?.gasto || ""}
                        onChange={(e) =>
                          handleChange(cat, idx + 1, "gasto", parseFloat(e.target.value))
                        }
                      />
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-xs"
                        placeholder="Presupuesto"
                        value={item?.presupuesto || ""}
                        onChange={(e) =>
                          handleChange(cat, idx + 1, "presupuesto", parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </td>
                );
              })}
              <td className="py-2 px-4 text-center">{getTotal(cat, "gasto").toFixed(2)}</td>
              <td className="py-2 px-4 text-center">{getTotal(cat, "presupuesto").toFixed(2)}</td>
              <td className="py-2 px-4 text-center">
                {(getTotal(cat, "presupuesto") - getTotal(cat, "gasto")).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={saveBudget}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar Budget
      </button>
    </div>
  );
}
