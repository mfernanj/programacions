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
  const unitatId = searchParams.get('unitatId')

  const where: Prisma.SituacioAprenentatgeWhereInput = {}
  if (unitatId) where.unitatDidacticaId = unitatId

  const situacions = await prisma.situacioAprenentatge.findMany({
    where,
    orderBy: { ordre: 'asc' },
  })

  return NextResponse.json(situacions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  if (!data.unitatDidacticaId || typeof data.titol !== 'string' || !data.titol.trim()) {
    return NextResponse.json({ error: 'Dades de la situació no vàlides' }, { status: 400 })
  }
  const unitat = await prisma.unitatDidactica.findUnique({
    where: { id: data.unitatDidacticaId },
    select: { programacio: { select: { id: true, autorId: true } } },
  })
  if (!unitat) return NextResponse.json({ error: 'Unitat no trobada' }, { status: 404 })
  if (!canManage(unitat.programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per modificar aquesta unitat' }, { status: 403 })
  }
  const situacio = await prisma.situacioAprenentatge.create({
    data: {
      titol: data.titol,
      descripcio: data.descripcio || undefined,
      competenciesEspecifiques: data.competenciesEspecifiques,
      mesuresSuportsUniversals: data.mesuresSuportsUniversals,
      activitatsInicials: data.activitatsInicials,
      activitatsDesenvolupament: data.activitatsDesenvolupament,
      activitatsEstructuracio: data.activitatsEstructuracio,
      activitatsAplicacio: data.activitatsAplicacio,
      unitatDidacticaId: data.unitatDidacticaId,
      ordre: data.ordre || 0,
    },
  })

  await createProgramacioVersion({ programacioId: unitat.programacio.id, autorId: session.user.id, canvis: `Situació d’aprenentatge creada: ${situacio.titol}` })

  return NextResponse.json(situacio, { status: 201 })
}
