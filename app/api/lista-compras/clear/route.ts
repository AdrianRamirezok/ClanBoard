import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const perfil = await prisma.perfil.findUnique({ where: { userId: authUser.userId } })
  if (!perfil) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  await prisma.listaCompras.deleteMany({
    where: { hogarId: perfil.hogarId, comprado: true },
  })

  return new NextResponse(null, { status: 204 })
}
