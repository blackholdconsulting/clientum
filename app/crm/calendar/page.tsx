// app/crm/calendar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  startOfMonth,
  subMonths,
} from 'date-fns'

type Reserva = Database['public']['Tables']['reservas']['Row']

export default function CalendarPage() {
  const supabase = createClientComponentClient<Database>()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today))
  const [reservas, setReservas] = useState<Reserva[]>([])

  // cargar reservas del mes
  useEffect(() => {
    const fetch = async () => {
      const from = format(currentMonth, 'yyyy-MM-01')
      const to = format(
        addMonths(currentMonth, 1).setDate(0),
        'yyyy-MM-dd'
      )
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .gte('fecha', from)
        .lte('fecha', to)
      if (error) console.error(error)
      else setReservas(data)
    }
    fetch()
  }, [currentMonth, supabase])

  // generar matriz de celdas (incluyendo huecos al inicio)
  const daysInMonth = getDaysInMonth(currentMonth)
  const startWeekday = getDay(currentMonth) // 0=domingo..6=sábado
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))
  }

  // agrupar reservas por día
  const reservasPorDia = reservas.reduce<Record<string, Reserva[]>>((acc, r) => {
    acc[r.fecha] = acc[r.fecha] ? [...acc[r.fecha], r] : [r]
    return acc
  }, {})

  return (
    <div className="p-6 bg-white rounded shadow">
      {/* controles mes */}
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          →
        </button>
      </header>

      {/* cabecera días */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-600">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* celdas */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {cells.map((day, idx) => {
          const key = day ? format(day, 'yyyy-MM-dd') : `empty-${idx}`
          const list = day ? reservasPorDia[key] || [] : []
          return (
            <div
              key={key}
              className={`min-h-[80px] p-1 border rounded ${
                day &&
                format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                  ? 'bg-indigo-50'
                  : ''
              }`}
            >
              <div className="text-right font-medium">
                {day ? format(day, 'd') : ''}
              </div>
              {list.map((r) => (
                <div
                  key={r.id}
                  className="mt-1 text-xs bg-indigo-100 rounded px-1 overflow-hidden whitespace-nowrap"
                >
                  {r.titulo || 'Reserva'}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
