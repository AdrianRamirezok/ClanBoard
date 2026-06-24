import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

function generarCodigo(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id } = await params
  const hogar = await prisma.hogar.update({
    where: { id },
    data: { codigoInvitacion: generarCodigo() },
  })

  return NextResponse.json({ codigo: hogar.codigoInvitacion })
}
