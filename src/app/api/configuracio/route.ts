import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await auth(request)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const config = await prisma.configuracio.findFirst()
    if (!config) {
      return NextResponse.json({ nomCentre: 'Centre Educatiu' })
    }

    return NextResponse.json({ nomCentre: config.nomCentre })
  } catch (error) {
    console.error('GET /api/configuracio error', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: process.env.NODE_ENV !== 'production' ? message : 'Error intern del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth(request)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
    }

    const data = await request.json()
    const nomCentre = typeof data.nomCentre === 'string' ? data.nomCentre.trim() : ''

    if (!nomCentre) {
      return NextResponse.json({ error: 'Nom del centre invàlid' }, { status: 400 })
    }

    const existingConfig = await prisma.configuracio.findFirst()

    const config = existingConfig
      ? await prisma.configuracio.update({ where: { id: existingConfig.id }, data: { nomCentre } })
      : await prisma.configuracio.create({ data: { nomCentre } })

    return NextResponse.json({ nomCentre: config.nomCentre })
  } catch (error) {
    console.error('PUT /api/configuracio error', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: process.env.NODE_ENV !== 'production' ? message : 'Error intern del servidor' },
      { status: 500 }
    )
  }
}
