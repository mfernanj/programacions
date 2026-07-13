import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canManage } from '@/lib/permissions'
import { createProgramacioVersion } from '@/lib/versions'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const programacioId = searchParams.get('programacioId')
  const nivellId = searchParams.get('nivellId')

  const where: Prisma.UnitatDidacticaWhereInput = {}
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
  if (!data.programacioId || typeof data.titol !== 'string' || !data.titol.trim()) {
    return NextResponse.json({ error: 'Dades de la unitat no vàlides' }, { status: 400 })
  }
  const programacio = await prisma.programacio.findUnique({
    where: { id: data.programacioId },
    select: { autorId: true },
  })
  if (!programacio) return NextResponse.json({ error: 'Programació no trobada' }, { status: 404 })
  if (!canManage(programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per modificar aquesta programació' }, { status: 403 })
  }
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

  await createProgramacioVersion({ programacioId: unitat.programacioId, autorId: session.user.id, canvis: `Unitat creada: ${unitat.titol}` })

  return NextResponse.json(unitat, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  const existent = await prisma.unitatDidactica.findUnique({
    where: { id: data.id },
    select: { programacio: { select: { id: true, autorId: true } } },
  })
  if (!existent) return NextResponse.json({ error: 'Unitat no trobada' }, { status: 404 })
  if (!canManage(existent.programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per modificar aquesta unitat' }, { status: 403 })
  }
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

  await createProgramacioVersion({ programacioId: existent.programacio.id, autorId: session.user.id, canvis: `Unitat actualitzada: ${unitat.titol}` })

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

  const existent = await prisma.unitatDidactica.findUnique({
    where: { id },
    select: { programacio: { select: { id: true, autorId: true } } },
  })
  if (!existent) return NextResponse.json({ error: 'Unitat no trobada' }, { status: 404 })
  if (!canManage(existent.programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per eliminar aquesta unitat' }, { status: 403 })
  }

  await prisma.unitatDidactica.delete({ where: { id } })
  await createProgramacioVersion({ programacioId: existent.programacio.id, autorId: session.user.id, canvis: 'Unitat eliminada' })
  return NextResponse.json({ success: true })
}
