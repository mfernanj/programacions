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
  const examen = await prisma.examen.findUnique({
    where: { id },
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
      autor: { select: { nom: true } },
    },
  })

  if (!examen) {
    return NextResponse.json({ error: 'No trobat' }, { status: 404 })
  }

  return NextResponse.json(examen)
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
  const formData = await request.formData()

  const titol = formData.get('titol') as string
  const descripcio = formData.get('descripcio') as string
  const cursEscolarId = formData.get('cursEscolarId') as string
  const nivellId = formData.get('nivellId') as string
  const materiaId = formData.get('materiaId') as string
  const avaluacio = formData.get('avaluacio') as string
  const tipus = (formData.get('tipus') as string) || 'examen'
  const dificultat = (formData.get('dificultat') as string) || 'mitja'
  const etiquetes = formData.get('etiquetes') as string
  const fitxer = formData.get('fitxer') as File | null
  const fitxerPath = formData.get('fitxerPath') as string

  // Obtenir examen existent per esborrar fitxer antic si cal
  const examenExistent = await prisma.examen.findUnique({
    where: { id },
    select: { fitxerPath: true },
  })

  let nouFitxerPath = fitxerPath || examenExistent?.fitxerPath

  // Si hi ha nou fitxer, guardar-lo
  if (fitxer && fitxer.size > 0) {
    const bytes = await fitxer.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const nomOriginal = fitxer.name
    const extensio = nomOriginal.split('.').pop()
    const nomNou = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extensio}`
    const path = `public/examens/${nomNou}`
    
    const fs = require('fs')
    const pathModule = require('path')
    const dir = pathModule.dirname(path)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(path, buffer)
    nouFitxerPath = `/examens/${nomNou}`

    // Esborrar fitxer antic si existeix
    if (examenExistent?.fitxerPath && !examenExistent.fitxerPath.startsWith('http')) {
      const oldPath = pathModule.join(process.cwd(), 'public', examenExistent.fitxerPath)
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }
  }

  const examen = await prisma.examen.update({
    where: { id },
    data: {
      titol,
      descripcio,
      cursEscolarId,
      nivellId,
      materiaId,
      avaluacio,
      tipus,
      dificultat,
      fitxerPath: nouFitxerPath,
      etiquetes,
    },
  })

  return NextResponse.json(examen)
}