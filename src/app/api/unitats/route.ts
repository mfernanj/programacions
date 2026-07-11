import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const programacioId = searchParams.get('programacioId')
  const nivellId = searchParams.get('nivellId')

  const where: any = {}
  if (programacioId) where.programacioId = programacioId
  if (nivellId) where.programacio = { is: { nivellId } }

  const unitats = await prisma.unitatDidactica.findMany({
    where,
    include: {
      programacio: {
        select: {
          id: true,
          titol: true,
          estat: true,
          cursEscolar: true,
          nivell: true,
          materia: true,
        },
      },
    },
    orderBy: [{ programacio: { updatedAt: 'desc' } }, { ordre: 'asc' }],
  })

  return NextResponse.json(unitats)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  const unitat = await prisma.unitatDidactica.create({
    data: {
      titol: data.titol,
      temporitzacio: data.temporitzacio,
      dataInici: data.dataInici ? new Date(data.dataInici) : undefined,
      dataFi: data.dataFi ? new Date(data.dataFi) : undefined,
      objectius: data.objectius,
      continguts: data.continguts,
      criterisAvaluacio: data.criterisAvaluacio,
      competencies: data.competencies,
      activitats: data.activitats,
      programacioId: data.programacioId,
      ordre: data.ordre || 0,
    },
  })

  return NextResponse.json(unitat, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  const unitat = await prisma.unitatDidactica.update({
    where: { id: data.id },
    data: {
      titol: data.titol,
      temporitzacio: data.temporitzacio,
      dataInici: data.dataInici ? new Date(data.dataInici) : null,
      dataFi: data.dataFi ? new Date(data.dataFi) : null,
      objectius: data.objectius,
      continguts: data.continguts,
      criterisAvaluacio: data.criterisAvaluacio,
      competencies: data.competencies,
      activitats: data.activitats,
      ordre: data.ordre,
    },
  })

  return NextResponse.json(unitat)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID requerit' }, { status: 400 })
  }

  await prisma.unitatDidactica.delete({ where: { id } })
  return NextResponse.json({ success: true })
}