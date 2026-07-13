import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const nivellId = searchParams.get('nivellId')
  const materiaId = searchParams.get('materiaId')
  const avaluacio = searchParams.get('avaluacio')

  const where: any = {}
  if (nivellId) where.nivellId = nivellId
  if (materiaId) where.materiaId = materiaId
  if (avaluacio) where.avaluacio = avaluacio

  const examens = await prisma.examen.findMany({
    where,
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
      autor: { select: { nom: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(examens)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

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

  // Validació: o fitxer o fitxerPath és obligatori
  if (!fitxer && !fitxerPath) {
    return NextResponse.json({ error: 'Cal pujar un arxiu o indicar una ruta' }, { status: 400 })
  }

  let fitxerGuardat = fitxerPath
  
  // Si hi ha fitxer, guardar-lo
  if (fitxer && fitxer.size > 0) {
    const bytes = await fitxer.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const nomOriginal = fitxer.name
    const extensio = nomOriginal.split('.').pop()
    const nomNou = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extensio}`
    const path = `public/examens/${nomNou}`
    
    // Crear directori si no existeix
    const fs = require('fs')
    const pathModule = require('path')
    const dir = pathModule.dirname(path)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(path, buffer)
    fitxerGuardat = `/examens/${nomNou}`
  }

  const examen = await prisma.examen.create({
    data: {
      titol,
      descripcio,
      cursEscolarId,
      nivellId,
      materiaId,
      avaluacio,
      tipus,
      dificultat,
      fitxerPath: fitxerGuardat,
      etiquetes,
      autorId: session.user.id,
    },
  })

  return NextResponse.json(examen, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerit' }, { status: 400 })

  // Obtenir el fitxer abans d'esborrar
  const examen = await prisma.examen.findUnique({
    where: { id },
    select: { fitxerPath: true },
  })

  await prisma.examen.delete({ where: { id } })

  // Esborrar arxiu físic si existeix
  if (examen?.fitxerPath) {
    const fs = require('fs')
    const pathModule = require('path')
    const filePath = pathModule.join(process.cwd(), 'public', examen.fitxerPath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  return NextResponse.json({ success: true })
}
