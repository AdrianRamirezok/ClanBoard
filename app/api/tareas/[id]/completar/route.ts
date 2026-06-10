import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const tarea = await prisma.tarea.update({
    where: { id },
    data: { completada: true },
  })

  if (tarea.asignadoA) {
    await prisma.perfil.update({
      where: { id: tarea.asignadoA },
      data: {
        xp: { increment: tarea.xpValor },
        xpMensual: { increment: tarea.xpValor },
      },
    })
  }

  return NextResponse.json(tarea)
}
