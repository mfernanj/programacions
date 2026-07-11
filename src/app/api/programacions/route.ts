import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const nivellId = searchParams.get('nivellId')
  const materiaId = searchParams.get('materiaId')
  const cursEscolarId = searchParams.get('cursEscolarId')

  const where: any = {}
  if (nivellId) where.nivellId = nivellId
  if (materiaId) where.materiaId = materiaId
  if (cursEscolarId) where.cursEscolarId = cursEscolarId

  const programacions = await prisma.programacio.findMany({
    where,
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
      autor: { select: { nom: true, email: true } },
      _count: { select: { unitatsDidactiques: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(programacions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  const programacio = await prisma.programacio.create({
    data: {
      titol: data.titol,
      descripcio: data.descripcio,
      cursEscolarId: data.cursEscolarId,
      nivellId: data.nivellId,
      materiaId: data.materiaId,
      autorId: session.user.id,
    },
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
    },
  })

  return NextResponse.json(programacio, { status: 201 })
}