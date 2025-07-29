"use client";

import { useEffect, useState } from "react";

interface BudgetItem {
  id?: string;
  categoria: string;
  mes: number;
  gasto: number;
  presupuesto: number;
  tipo: string;
}

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const categoriasGastos = [
  "Alquiler local",
  "Alquiler maquinaria",
  "Luz / Electricidad",
  "Agua",
  "Teléfono",
  "Internet / WiFi",
  "Combustible / Transporte",
  "Suministros / Materiales",
  "Publicidad / Marketing",
  "Software / Licencias",
  "Mantenimiento",
  "Seguros",
  "Salarios / Autónomos",
  "Asesoría / Gestoría",
  "Impuestos / Tasas",
  "Otros gastos variables",
];

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetItem[]>([]);

  useEffect(() => {
    fetch("/api/budget-monthly")
      .then((res) => res.json())
      .then((data) => setBudget(data));
  }, []);

  const handleChange = (
    cat: string,
    mes: number,
    tipo: "gasto" | "ingreso",
    field: "gasto" | "presupuesto",
    value: number
  ) => {
    setBudget((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (b) => b.categoria === cat && b.mes === mes && b.tipo === tipo
      );
      if (index >= 0) {
        updated[index] = { ...updated[index], [field]: value };
      } else {
        updated.push({
          categoria: cat,
          mes,
          gasto: 0,
          presupuesto: 0,
          tipo,
          [field]: value,
        });
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

  const getTotal = (cat: string, tipo: "gasto" | "ingreso", field: "gasto" | "presupuesto") => {
    return budget
      .filter((b) => b.categoria === cat && b.tipo === tipo)
      .reduce((acc, curr) => acc + Number(curr[field] || 0), 0);
  };

  const totalIngresos = getTotal("Ingresos", "ingreso", "gasto");
  const totalGastos = categoriasGastos.reduce(
    (sum, cat) => sum + getTotal(cat, "gasto", "gasto"),
    0
  );
  const balanceFinal = totalIngresos - totalGastos;

  return (
    <div className="p-6 overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">Budget Completo</h1>

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
          {/* Ingresos */}
          <tr key="Ingresos" className="border-b bg-green-50 font-semibold">
            <td className="py-2 px-4">Ingresos</td>
            {meses.map((_, idx) => {
              const item = budget.find((b) => b.categoria === "Ingresos" && b.mes === idx + 1);
              return (
                <td key={idx} className="py-2 px-1">
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      className="w-full p-1 border rounded text-xs"
                      placeholder="Real"
                      value={item?.gasto || ""}
                      onChange={(e) =>
                        handleChange("Ingresos", idx + 1, "ingreso", "gasto", parseFloat(e.target.value))
                      }
                    />
                    <input
                      type="number"
                      className="w-full p-1 border rounded text-xs"
                      placeholder="Previsto"
                      value={item?.presupuesto || ""}
                      onChange={(e) =>
                        handleChange("Ingresos", idx + 1, "ingreso", "presupuesto", parseFloat(e.target.value))
                      }
                    />
                  </div>
                </td>
              );
            })}
            <td className="py-2 px-4 text-center">{getTotal("Ingresos", "ingreso", "gasto").toFixed(2)}</td>
            <td className="py-2 px-4 text-center">{getTotal("Ingresos", "ingreso", "presupuesto").toFixed(2)}</td>
            <td className="py-2 px-4 text-center">
              {(getTotal("Ingresos", "ingreso", "presupuesto") -
                getTotal("Ingresos", "ingreso", "gasto")).toFixed(2)}
            </td>
          </tr>

          {/* Gastos */}
          {categoriasGastos.map((cat) => (
            <tr key={cat} className="border-b">
              <td className="py-2 px-4">{cat}</td>
              {meses.map((_, idx) => {
                const item = budget.find(
                  (b) => b.categoria === cat && b.mes === idx + 1 && b.tipo === "gasto"
                );
                return (
                  <td key={idx} className="py-2 px-1">
                    <div className="flex flex-col gap-1">
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-xs"
                        placeholder="Gasto"
                        value={item?.gasto || ""}
                        onChange={(e) =>
                          handleChange(cat, idx + 1, "gasto", "gasto", parseFloat(e.target.value))
                        }
                      />
                      <input
                        type="number"
                        className="w-full p-1 border rounded text-xs"
                        placeholder="Presupuesto"
                        value={item?.presupuesto || ""}
                        onChange={(e) =>
                          handleChange(cat, idx + 1, "gasto", "presupuesto", parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </td>
                );
              })}
              <td className="py-2 px-4 text-center">{getTotal(cat, "gasto", "gasto").toFixed(2)}</td>
              <td className="py-2 px-4 text-center">{getTotal(cat, "gasto", "presupuesto").toFixed(2)}</td>
              <td className="py-2 px-4 text-center">
                {(getTotal(cat, "gasto", "presupuesto") - getTotal(cat, "gasto", "gasto")).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-200 font-bold">
            <td className="py-2 px-4">Balance Final</td>
            <td colSpan={12}></td>
            <td className="text-center" colSpan={3}>
              {balanceFinal.toFixed(2)} €
            </td>
          </tr>
        </tfoot>
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
