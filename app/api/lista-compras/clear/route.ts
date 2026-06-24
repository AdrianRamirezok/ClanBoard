import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: session.user.id } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  await prisma.listaCompras.deleteMany({
    where: { hogarId: perfil.hogarId, comprado: true },
  })

  return new NextResponse(null, { status: 204 })
}
