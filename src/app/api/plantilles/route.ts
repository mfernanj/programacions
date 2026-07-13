import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/permissions'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })

  return NextResponse.json(await prisma.plantilla.findMany({ orderBy: { nom: 'asc' } }))
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || !isAdmin(session.user)) return NextResponse.json({ error: 'No autoritzat' }, { status: 403 })

  const data = await request.json()
  const nom = typeof data.nom === 'string' ? data.nom.trim() : ''
  const descripcio = typeof data.descripcio === 'string' ? data.descripcio.trim() : null
  const estructuraJSON = typeof data.estructuraJSON === 'string' ? data.estructuraJSON.trim() : ''
  if (!nom || !estructuraJSON) return NextResponse.json({ error: 'El nom i l’estructura són obligatoris' }, { status: 400 })
  try {
    JSON.parse(estructuraJSON)
  } catch {
    return NextResponse.json({ error: 'L’estructura ha de ser JSON vàlid' }, { status: 400 })
  }

  const plantilla = await prisma.plantilla.create({ data: { nom, descripcio, estructuraJSON } })
  return NextResponse.json(plantilla, { status: 201 })
}
