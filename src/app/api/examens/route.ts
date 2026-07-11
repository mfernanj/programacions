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
  const avaluacio = searchParams.get('avaluacio')

  const where: any = {}
  if (nivellId) where.nivellId = nivellId
  if (materiaId) where.materiaId = materiaId
  if (avaluacio) where.avaluacio = avaluacio

  const examens = await prisma.examen.findMany({
    where,
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
      autor: { select: { nom: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(examens)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  const examen = await prisma.examen.create({
    data: {
      titol: data.titol,
      descripcio: data.descripcio,
      cursEscolarId: data.cursEscolarId,
      nivellId: data.nivellId,
      materiaId: data.materiaId,
      avaluacio: data.avaluacio,
      tipus: data.tipus || 'examen',
      dificultat: data.dificultat || 'mitja',
      fitxerPath: data.fitxerPath,
      etiquetes: data.etiquetes,
      autorId: session.user.id,
    },
  })

  return NextResponse.json(examen, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerit' }, { status: 400 })

  await prisma.examen.delete({ where: { id } })
  return NextResponse.json({ success: true })
}