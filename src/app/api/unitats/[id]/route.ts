import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { canManage } from '@/lib/permissions'
import { createProgramacioVersion } from '@/lib/versions'

type UnitatPayload = {
  titol?: string; temporitzacio?: string; dataInici?: string | null; dataFi?: string | null
  objectius?: string; continguts?: string; criterisAvaluacio?: string | null
  competencies?: string | null; activitats?: string | null; ordre?: number | string
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

  const existent = await prisma.unitatDidactica.findUnique({
    where: { id },
    select: { programacio: { select: { id: true, autorId: true } } },
  })
  if (!existent) return NextResponse.json({ error: 'Unitat no trobada' }, { status: 404 })
  if (!canManage(existent.programacio.autorId, session.user)) {
    return NextResponse.json({ error: 'No tens permís per modificar aquesta unitat' }, { status: 403 })
  }

  try {
    const raw = await request.text()
    let payload: UnitatPayload = {}
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : {}
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error()
      payload = parsed as UnitatPayload
    } catch {
      return NextResponse.json({ error: 'Payload JSON invalid' }, { status: 400 })
    }

    const isValidDate = (v: unknown): v is string => {
      if (!v) return false
      if (typeof v !== 'string') return false
      const t = Date.parse(v)
      return !isNaN(t)
    }

    const safeData: Prisma.UnitatDidacticaUpdateInput = {
      titol: payload.titol,
      temporitzacio: payload.temporitzacio,
      dataInici: isValidDate(payload.dataInici) ? new Date(payload.dataInici) : null,
      dataFi: isValidDate(payload.dataFi) ? new Date(payload.dataFi) : null,
      objectius: payload.objectius,
      continguts: payload.continguts,
      criterisAvaluacio: payload.criterisAvaluacio,
      competencies: payload.competencies,
      activitats: payload.activitats,
    }

    if (payload.ordre !== undefined) {
      const parsedOrdre = typeof payload.ordre === 'number' ? payload.ordre : parseInt(String(payload.ordre), 10)
      if (!isNaN(parsedOrdre)) safeData.ordre = parsedOrdre
    }

    const unitat = await prisma.unitatDidactica.update({
      where: { id },
      data: safeData,
    })
    await createProgramacioVersion({ programacioId: existent.programacio.id, autorId: session.user.id, canvis: `Unitat actualitzada: ${unitat.titol}` })

    return NextResponse.json(unitat)
  } catch (err) {
    console.error('PUT /api/unitats/[id] error:', err)
    const message = err instanceof Error ? err.message : 'Error intern del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
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
