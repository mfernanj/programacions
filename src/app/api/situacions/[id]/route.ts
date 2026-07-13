import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canManage } from '@/lib/permissions'
import { createProgramacioVersion } from '@/lib/versions'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  const existent = await prisma.situacioAprenentatge.findUnique({
    where: { id },
    select: { unitatDidactica: { select: { programacio: { select: { id: true, autorId: true } } } } },
  })
  if (!existent) return NextResponse.json({ error: 'Situació no trobada' }, { status: 404 })
  if (!canManage(existent.unitatDidactica.programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per modificar aquesta situació' }, { status: 403 })
  }
  const data = await request.json()
  const situacio = await prisma.situacioAprenentatge.update({
    where: { id },
    data: {
      titol: data.titol,
      descripcio: data.descripcio || undefined,
      competenciesEspecifiques: data.competenciesEspecifiques,
      mesuresSuportsUniversals: data.mesuresSuportsUniversals,
      activitatsInicials: data.activitatsInicials,
      activitatsDesenvolupament: data.activitatsDesenvolupament,
      activitatsEstructuracio: data.activitatsEstructuracio,
      activitatsAplicacio: data.activitatsAplicacio,
      ordre: data.ordre,
    },
  })
  await createProgramacioVersion({ programacioId: existent.unitatDidactica.programacio.id, autorId: session.user.id, canvis: `Situació d’aprenentatge actualitzada: ${situacio.titol}` })

  return NextResponse.json(situacio)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  const existent = await prisma.situacioAprenentatge.findUnique({
    where: { id },
    select: { unitatDidactica: { select: { programacio: { select: { id: true, autorId: true } } } } },
  })
  if (!existent) return NextResponse.json({ error: 'Situació no trobada' }, { status: 404 })
  if (!canManage(existent.unitatDidactica.programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per eliminar aquesta situació' }, { status: 403 })
  }
  await prisma.situacioAprenentatge.delete({ where: { id } })
  await createProgramacioVersion({ programacioId: existent.unitatDidactica.programacio.id, autorId: session.user.id, canvis: 'Situació d’aprenentatge eliminada' })
  return NextResponse.json({ success: true })
}
