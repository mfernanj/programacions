import { prisma } from '@/lib/prisma'

type VersionInput = {
  programacioId: string
  autorId: string
  canvis: string
  initial?: boolean
}

export async function createProgramacioVersion({ programacioId, autorId, canvis, initial = false }: VersionInput) {
  await prisma.$transaction(async (tx) => {
    const programacio = await tx.programacio.findUnique({
      where: { id: programacioId },
      include: {
        nivell: true,
        materia: true,
        cursEscolar: true,
        unitatsDidactiques: {
          orderBy: { ordre: 'asc' },
          include: { situacionsAprenentatge: { orderBy: { ordre: 'asc' } } },
        },
        metodologies: true,
        atencionsDiversitat: true,
      },
    })
    if (!programacio) return

    const numero = initial ? programacio.versio : programacio.versio + 1
    const contingutJSON = JSON.stringify({ ...programacio, versio: numero })

    if (!initial) await tx.programacio.update({ where: { id: programacioId }, data: { versio: numero } })
    await tx.versioProgramacio.create({
      data: { programacioId, autorId, numero, canvis, contingutJSON },
    })
  })
}
