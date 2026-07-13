import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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
      versions: { orderBy: { numero: 'desc' }, take: 5 },
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

  const programacio = await prisma.programacio.update({
    where: { id },
    data: {
      titol: data.titol,
      descripcio: data.descripcio,
      estat: data.estat,
    },
  })

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
    select: { cursEscolarId: true },
  })
  
  if (!prog) {
    return NextResponse.json({ error: 'No trobada' }, { status: 404 })
  }
  
  await prisma.programacio.delete({ where: { id } })

  // Comprovar si queden programacions per a aquest curs
  const count = await prisma.programacio.count({
    where: { cursEscolarId: prog.cursEscolarId },
  })
  
  if (count === 0) {
    await prisma.cursEscolar.delete({
      where: { id: prog.cursEscolarId },
    })
  }

  return NextResponse.json({ success: true })
}
