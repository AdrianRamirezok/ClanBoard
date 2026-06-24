import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const tarea = await prisma.tarea.update({
    where: { id },
    data: {
      titulo: body.titulo,
      descripcion: body.descripcion || null,
      asignadoA: body.asignadoA || null,
      xpValor: body.xpValor,
      color: body.color,
      fechaLimite: body.fechaLimite ?? null,
    },
  })

  return NextResponse.json(tarea)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  await prisma.tarea.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
