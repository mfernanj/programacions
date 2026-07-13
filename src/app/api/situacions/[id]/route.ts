import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
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

  return NextResponse.json(situacio)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  await prisma.situacioAprenentatge.delete({ where: { id } })
  return NextResponse.json({ success: true })
}