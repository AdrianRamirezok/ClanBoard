import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const hogar = await prisma.hogar.update({
    where: { id },
    data: { nombre: body.nombre },
  })

  return NextResponse.json(hogar)
}
