import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: authUser.userId } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const body = await req.json()
  const tarea = await prisma.tarea.create({
    data: {
      hogarId: perfil.hogarId,
      titulo: body.titulo,
      descripcion: body.descripcion || null,
      asignadoA: body.asignadoA || null,
      completada: false,
      xpValor: body.xpValor,
      color: body.color || null,
      fechaLimite: body.fechaLimite || null,
    },
  })

  return NextResponse.json(tarea, { status: 201 })
}
