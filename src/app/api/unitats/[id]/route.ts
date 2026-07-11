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

  try {
    const raw = await request.text()
    console.debug('PUT /api/unitats/[id] raw body:', raw)
    let payload: any = {}
    try {
      payload = raw ? JSON.parse(raw) : {}
    } catch (e) {
      console.debug('PUT /api/unitats/[id] JSON parse error:', e)
      return NextResponse.json({ error: 'Payload JSON invalid' }, { status: 400 })
    }

    console.debug('PUT /api/unitats/[id] payload (parsed):', payload)

    const isValidDate = (v: any) => {
      if (!v) return false
      const t = Date.parse(v)
      return !isNaN(t)
    }

    const safeData: any = {
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

    return NextResponse.json(unitat)
  } catch (err: any) {
    console.error('PUT /api/unitats/[id] error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
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
  await prisma.unitatDidactica.delete({ where: { id } })

  return NextResponse.json({ success: true })
}