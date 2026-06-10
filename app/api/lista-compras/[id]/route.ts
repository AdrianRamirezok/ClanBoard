import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const item = await prisma.listaCompras.update({
    where: { id },
    data: { comprado: body.comprado },
  })

  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = await getAuthUser()
  if (!authUser) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  await prisma.listaCompras.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
