// app/gastos/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
}

const PAGE_SIZE = 10;

export default function GastosPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchGastos();
  }, [page]);

  async function fetchGastos() {
    setLoading(true);
    const { data, count, error } = await supabase
      .from('gastos') // quitamos el genérico aquí
      .select('*', { count: 'exact' })
      .order('fecha', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) {
      console.error('Error cargando gastos:', error);
    } else if (data) {
      setGastos(data as Gasto[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gastos</h1>
      {loading ? (
        <p>Cargando gastos…</p>
      ) : (
        <>
          <ul className="space-y-2">
            {gastos.map((g) => (
              <li key={g.id}>
                <span className="font-medium">
                  {new Date(g.fecha).toLocaleDateString()}:
                </span>{' '}
                {g.descripcion} — {g.monto.toFixed(2)} €
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded"
            >
              Anterior
            </button>
            <span>
              Página {page} de {Math.ceil(totalCount / PAGE_SIZE)}
            </span>
            <button
              onClick={() =>
                setPage((p) =>
                  p * PAGE_SIZE < totalCount ? p + 1 : p
                )
              }
              disabled={page * PAGE_SIZE >= totalCount}
              className="px-3 py-1 border rounded"
            >
              Siguiente
            </button>
          </div>

          <button
            onClick={() => router.push('/gastos/nuevo')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Nuevo Gasto
          </button>
        </>
      )}
    </main>
  );
}
