import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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

  const unitat = await prisma.unitatDidactica.update({
    where: { id },
    data: {
      titol: data.titol,
      temporitzacio: data.temporitzacio,
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { id } = await params
  await prisma.unitatDidactica.delete({ where: { id } })

  return NextResponse.json({ success: true })
}