import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const nivells = await prisma.nivell.findMany({
    include: {
      matèries: true,
    },
    orderBy: { codi: 'asc' },
  })

  return NextResponse.json(nivells)
}