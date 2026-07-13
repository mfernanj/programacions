import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createProgramacioVersion } from '@/lib/versions'

const validSchoolYear = (anyInici: unknown, anyFi: unknown) =>
  typeof anyInici === 'number' && typeof anyFi === 'number' &&
  Number.isInteger(anyInici) && Number.isInteger(anyFi) && anyFi === anyInici + 1

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const nivellId = searchParams.get('nivellId')
  const materiaId = searchParams.get('materiaId')
  const cursEscolarId = searchParams.get('cursEscolarId')

  const where: Prisma.ProgramacioWhereInput = {}
  if (nivellId) where.nivellId = nivellId
  if (materiaId) where.materiaId = materiaId
  if (cursEscolarId) where.cursEscolarId = cursEscolarId

  const programacions = await prisma.programacio.findMany({
    where,
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
      autor: { select: { nom: true, email: true } },
      _count: { select: { unitatsDidactiques: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(programacions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autoritzat' }, { status: 401 })
  }

  const data = await request.json()
  
  // Gestionar curs escolar: buscar o crear
  const anyInici = data.anyInici
  const anyFi = data.anyFi

  if (!validSchoolYear(anyInici, anyFi) || typeof data.titol !== 'string' || !data.titol.trim()) {
    return NextResponse.json({ error: 'Dades de programació no vàlides' }, { status: 400 })
  }
  
  let cursEscolar = await prisma.cursEscolar.findFirst({
    where: { anyInici, anyFi },
  })
  
  if (!cursEscolar) {
    cursEscolar = await prisma.cursEscolar.create({
      data: { anyInici, anyFi, actiu: false },
    })
  }

  // Opció de copiar des d'una programació existent
  if (data.copiarDeId) {
    const original = await prisma.programacio.findUnique({
      where: { id: data.copiarDeId },
      include: {
        unitatsDidactiques: {
          include: { situacionsAprenentatge: true },
        },
        metodologies: true,
        atencionsDiversitat: true,
      },
    })

    if (!original) {
      return NextResponse.json({ error: 'Programació origen no trobada' }, { status: 404 })
    }

// Deep copy amb transacció
     const programacio = await prisma.$transaction(async (tx) => {
       // Generar títol amb -còpia si és el mateix que l'original
       let titol = data.titol
       if (titol === original.titol) {
         titol = `${original.titol} - còpia`
       }
       
       const novaProg = await tx.programacio.create({
         data: {
           titol,
           descripcio: data.descripcio || original.descripcio,
           cursEscolarId: cursEscolar.id,
           nivellId: original.nivellId,
           materiaId: original.materiaId,
           autorId: session.user.id,
         },
       })

      // Copiar unitats didàctiques i SA
      for (const unitat of original.unitatsDidactiques) {
        const novaUnitat = await tx.unitatDidactica.create({
          data: {
            titol: unitat.titol,
            temporitzacio: unitat.temporitzacio,
            dataInici: unitat.dataInici,
            dataFi: unitat.dataFi,
            objectius: unitat.objectius,
            continguts: unitat.continguts,
            criterisAvaluacio: unitat.criterisAvaluacio,
            competencies: unitat.competencies,
            activitats: unitat.activitats,
            ordre: unitat.ordre,
            programacioId: novaProg.id,
          },
        })

        // Copiar SA de cada unitat
        for (const sa of unitat.situacionsAprenentatge) {
          await tx.situacioAprenentatge.create({
            data: {
              titol: sa.titol,
              descripcio: sa.descripcio,
              competenciesEspecifiques: sa.competenciesEspecifiques,
              mesuresSuportsUniversals: sa.mesuresSuportsUniversals,
              activitatsInicials: sa.activitatsInicials,
              activitatsDesenvolupament: sa.activitatsDesenvolupament,
              activitatsEstructuracio: sa.activitatsEstructuracio,
              activitatsAplicacio: sa.activitatsAplicacio,
              ordre: sa.ordre,
              unitatDidacticaId: novaUnitat.id,
            },
          })
        }
      }

      // Copiar metodologia
      if (original.metodologies && original.metodologies.length > 0) {
        const met = original.metodologies[0]
        await tx.metodologia.create({
          data: {
            estrategies: met.estrategies,
            recursos: met.recursos,
            agrupaments: met.agrupaments,
            avaluacio: met.avaluacio,
            programacioId: novaProg.id,
          },
        })
      }

      // Copiar atenció a la diversitat
      if (original.atencionsDiversitat && original.atencionsDiversitat.length > 0) {
        const ad = original.atencionsDiversitat[0]
        await tx.atencioDiversitat.create({
          data: {
            mesuresGenerals: ad.mesuresGenerals,
            mesuresEspecifiques: ad.mesuresEspecifiques,
            adaptacions: ad.adaptacions,
            programacioId: novaProg.id,
          },
        })
      }

      // Retornar amb includes
      return await tx.programacio.findUnique({
        where: { id: novaProg.id },
        include: {
          nivell: true,
          materia: true,
          cursEscolar: true,
          unitatsDidactiques: {
            include: { situacionsAprenentatge: true },
            orderBy: { ordre: 'asc' },
          },
          metodologies: true,
          atencionsDiversitat: true,
        },
      })
    })

    if (programacio) await createProgramacioVersion({ programacioId: programacio.id, autorId: session.user.id, canvis: 'Programació creada a partir d’una còpia', initial: true })
    return NextResponse.json(programacio, { status: 201 })
  }

  const materia = await prisma.materia.findFirst({
    where: { id: data.materiaId, nivellId: data.nivellId },
    select: { id: true },
  })
  if (!materia) {
    return NextResponse.json({ error: 'La matèria no correspon al nivell seleccionat' }, { status: 400 })
  }

  // Crear programació buida (sense copiar)
  const programacio = await prisma.programacio.create({
    data: {
      titol: data.titol,
      descripcio: data.descripcio,
      cursEscolarId: cursEscolar.id,
      nivellId: data.nivellId,
      materiaId: data.materiaId,
      autorId: session.user.id,
    },
    include: {
      nivell: true,
      materia: true,
      cursEscolar: true,
    },
  })

  await createProgramacioVersion({ programacioId: programacio.id, autorId: session.user.id, canvis: 'Programació creada', initial: true })
  return NextResponse.json(programacio, { status: 201 })
}
