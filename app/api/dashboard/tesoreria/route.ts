// app/api/dashboard/tesoreria/route.ts

import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"  // o el cliente DB que uses

export async function GET(req: NextRequest) {
  // 1. Recupera la sesión
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // 2. Filtra por userId
  const userId = session.user.id

  // 3. Consulta la base de datos
  // Ejemplo usando Prisma; ajusta a tu ORM/DB
  const kpi = await prisma.tesoreriaKpi.findUnique({
    where: { userId },
    select: {
      saldoTotal: true,
      entradasMes: true,
      salidasMes: true,
      balanceNeto: true
    }
  })

  const cashflow = await prisma.tesoreriaCashflow.findMany({
    where: { userId },
    orderBy: { mes: "asc" },
    select: {
      mes: true,
      entradas: true,
      salidas: true
    }
  })

  // 4. Devuelve los datos personalizados
  return NextResponse.json({ kpi, cashflow })
}
