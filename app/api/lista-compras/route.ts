import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: authUser.userId } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const items = await prisma.listaCompras.findMany({
    where: { hogarId: perfil.hogarId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: authUser.userId } })
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
