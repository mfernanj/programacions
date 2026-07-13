import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const unitatId = searchParams.get('unitatId')

  const where: any = {}
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

  return NextResponse.json(situacio, { status: 201 })
}