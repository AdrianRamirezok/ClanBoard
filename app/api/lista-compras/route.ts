import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: session.user.id } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const items = await prisma.listaCompras.findMany({
    where: { hogarId: perfil.hogarId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: session.user.id } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const body = await req.json()
  const item = await prisma.listaCompras.create({
    data: {
      hogarId: perfil.hogarId,
      nombre: body.nombre.trim(),
      agregadoPor: perfil.id,
      comprado: false,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
