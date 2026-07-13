import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canManage } from '@/lib/permissions'
import { createProgramacioVersion } from '@/lib/versions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  const programacio = await prisma.programacio.findUnique({
    where: { id },
    include: {
      nivell: true,
      materia: { include: { blocs: { include: { criterisAvaluacio: true } } } },
      cursEscolar: true,
      autor: { select: { nom: true, email: true } },
      unitatsDidactiques: {
        orderBy: { ordre: 'asc' },
        include: {
          situacionsAprenentatge: { orderBy: { ordre: 'asc' } },
        },
      },
      metodologies: true,
      atencionsDiversitat: true,
      versions: { include: { autor: { select: { nom: true } } }, orderBy: { numero: 'desc' }, take: 10 },
    },
  })

  if (!programacio) {
    return NextResponse.json({ error: 'No trobada' }, { status: 404 })
  }

  return NextResponse.json(programacio)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  const data = await request.json()

  const existing = await prisma.programacio.findUnique({ where: { id }, select: { autorId: true, cursEscolarId: true } })
  if (!existing) return NextResponse.json({ error: 'No trobada' }, { status: 404 })
  if (!canManage(existing.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per editar aquesta programació' }, { status: 403 })
  }

  const updateData: Prisma.ProgramacioUncheckedUpdateInput = {
    titol: data.titol,
    descripcio: data.descripcio,
    estat: data.estat,
  }

  // Si es canvia el curs escolar
  if (data.cursEscolarId) {
    // Obtenir el curs escolar antic
    updateData.cursEscolarId = data.cursEscolarId
  }

  const programacio = await prisma.programacio.update({
    where: { id },
    data: updateData,
  })

  if (data.cursEscolarId && existing.cursEscolarId !== data.cursEscolarId) {
    const count = await prisma.programacio.count({ where: { cursEscolarId: existing.cursEscolarId } })
    const examens = await prisma.examen.count({ where: { cursEscolarId: existing.cursEscolarId } })
    if (count === 0 && examens === 0) await prisma.cursEscolar.delete({ where: { id: existing.cursEscolarId } })
  }
  await createProgramacioVersion({ programacioId: id, autorId: session.user.id, canvis: 'Dades generals de la programació actualitzades' })

  return NextResponse.json(programacio)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  
  // Obtenir el cursEscolarId abans d'eliminar
  const prog = await prisma.programacio.findUnique({
    where: { id },
    select: { cursEscolarId: true, autorId: true },
  })
  
  if (!prog) {
    return NextResponse.json({ error: 'No trobada' }, { status: 404 })
  }
  if (!canManage(prog.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per eliminar aquesta programació' }, { status: 403 })
  }
  
  await prisma.programacio.delete({ where: { id } })

  // Comprovar si queden programacions per a aquest curs
  const count = await prisma.programacio.count({
    where: { cursEscolarId: prog.cursEscolarId },
  })
  
  if (count === 0) {
    const examens = await prisma.examen.count({ where: { cursEscolarId: prog.cursEscolarId } })
    if (examens === 0) await prisma.cursEscolar.delete({ where: { id: prog.cursEscolarId } })
  }

  return NextResponse.json({ success: true })
}
