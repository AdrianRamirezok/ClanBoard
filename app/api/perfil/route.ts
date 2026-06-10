import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const perfil = await prisma.perfil.update({
    where: { userId: authUser.userId },
    data: { nombre: body.nombre, avatar: body.avatar },
  })

  return NextResponse.json(perfil)
}
