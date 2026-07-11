import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciant seed...')

  // Crear usuari admin per defecte
  const admin = await prisma.usuari.upsert({
    where: { email: 'admin@institut.edu' },
    update: {},
    create: {
      nom: 'Administrador',
      email: 'admin@institut.edu',
      passwordHash: '$2b$10$2Z.8lfPPBviLr4LmerxM..uuvT2OKVyoyt0obOz3HZylfJp4jeuo2',
      rol: 'admin',
    },
  })
  console.log('✅ Usuari admin creat:', admin.email)

  // Crear cursos escolars
  const curs2425 = await prisma.cursEscolar.findFirst({ where: { anyInici: 2024 } }) ||
    await prisma.cursEscolar.create({ data: { anyInici: 2024, anyFi: 2025, actiu: false } })
  const curs2526 = await prisma.cursEscolar.findFirst({ where: { anyInici: 2025 } }) ||
    await prisma.cursEscolar.create({ data: { anyInici: 2025, anyFi: 2026, actiu: false } })
  const curs2627 = await prisma.cursEscolar.findFirst({ where: { anyInici: 2026 } }) ||
    await prisma.cursEscolar.create({ data: { anyInici: 2026, anyFi: 2027, actiu: true } })
  console.log('✅ Cursos escolars creats')

  // Configuració inicial del centre educatiu
  await prisma.configuracio.findFirst() ||
    prisma.configuracio.create({ data: { nomCentre: 'Institut Educatiu' } })

  // Crear nivells
  const nivells = await Promise.all([
    prisma.nivell.upsert({ where: { codi: '1rESO' }, update: { nom: "1r d'ESO" }, create: { codi: '1rESO', nom: "1r d'ESO" } }),
    prisma.nivell.upsert({ where: { codi: '2nESO' }, update: { nom: "2n d'ESO" }, create: { codi: '2nESO', nom: "2n d'ESO" } }),
    prisma.nivell.upsert({ where: { codi: '3rESO' }, update: { nom: "3r d'ESO" }, create: { codi: '3rESO', nom: "3r d'ESO" } }),
    prisma.nivell.upsert({ where: { codi: '4tESO' }, update: { nom: "4t d'ESO" }, create: { codi: '4tESO', nom: "4t d'ESO" } }),
    prisma.nivell.upsert({ where: { codi: '1rBatx' }, update: { nom: '1r de Batxillerat' }, create: { codi: '1rBatx', nom: '1r de Batxillerat' } }),
    prisma.nivell.upsert({ where: { codi: '2nBatx' }, update: { nom: '2n de Batxillerat' }, create: { codi: '2nBatx', nom: '2n de Batxillerat' } }),
  ])
  console.log('✅ Nivells creats')

  // Crear matèries per nivell
  const materia1rESO = await prisma.materia.findFirst({ where: { codi: 'Mates1rESO' } }) ||
    await prisma.materia.create({ data: { codi: 'Mates1rESO', nom: 'Matemàtiques', nivellId: nivells[0].id } })
  const materia2nESO = await prisma.materia.findFirst({ where: { codi: 'Mates2nESO' } }) ||
    await prisma.materia.create({ data: { codi: 'Mates2nESO', nom: 'Matemàtiques', nivellId: nivells[1].id } })
  const materia3rESO = await prisma.materia.findFirst({ where: { codi: 'Mates3rESO' } }) ||
    await prisma.materia.create({ data: { codi: 'Mates3rESO', nom: 'Matemàtiques', nivellId: nivells[2].id } })
  const materia4tAcad = await prisma.materia.findFirst({ where: { codi: 'Mates4tAcad' } }) ||
    await prisma.materia.create({ data: { codi: 'Mates4tAcad', nom: 'Matemàtiques Acadèmiques', nivellId: nivells[3].id } })
  const materia4tApl = await prisma.materia.findFirst({ where: { codi: 'Mates4tApl' } }) ||
    await prisma.materia.create({ data: { codi: 'Mates4tApl', nom: 'Matemàtiques Aplicades', nivellId: nivells[3].id } })
  const materia1rBatx = await prisma.materia.findFirst({ where: { codi: 'MatesI' } }) ||
    await prisma.materia.create({ data: { codi: 'MatesI', nom: 'Matemàtiques I', nivellId: nivells[4].id } })
  const materia2nBatx = await prisma.materia.findFirst({ where: { codi: 'MatesII' } }) ||
    await prisma.materia.create({ data: { codi: 'MatesII', nom: 'Matemàtiques II', nivellId: nivells[5].id } })
  console.log('✅ Matèries creades')

  // Crear blocs per a cada matèria
  const blocsESO = [
    { codi: 'BL1', nom: 'Processos, mètodes i actituds en matemàtiques' },
    { codi: 'BL2', nom: 'Nombres i àlgebra' },
    { codi: 'BL3', nom: 'Geometria' },
    { codi: 'BL4', nom: 'Funcions' },
    { codi: 'BL5', nom: 'Estadística i probabilitat' },
  ]

  const blocsBatx = [
    { codi: 'BL1', nom: 'Processos, mètodes i actituds en matemàtiques' },
    { codi: 'BL2', nom: 'Nombres i àlgebra' },
    { codi: 'BL3', nom: 'Anàlisi' },
    { codi: 'BL4', nom: 'Geometria' },
    { codi: 'BL5', nom: 'Estadística i probabilitat' },
  ]

  // Crear blocs per a cada matèria d'ESO
  for (const materia of [materia1rESO, materia2nESO, materia3rESO, materia4tAcad, materia4tApl]) {
    for (const bloc of blocsESO) {
      await prisma.bloc.findFirst({ where: { codi: bloc.codi, materiaId: materia.id } }) ||
        prisma.bloc.create({ data: { codi: bloc.codi, nom: bloc.nom, materiaId: materia.id } })
    }
  }

  // Crear blocs per a cada matèria de Batxillerat
  for (const materia of [materia1rBatx, materia2nBatx]) {
    for (const bloc of blocsBatx) {
      await prisma.bloc.findFirst({ where: { codi: bloc.codi, materiaId: materia.id } }) ||
        prisma.bloc.create({ data: { codi: bloc.codi, nom: bloc.nom, materiaId: materia.id } })
    }
  }
  console.log('✅ Blocs creats')

  // Crear plantilles predefinides
  await prisma.plantilla.findFirst({ where: { nom: 'Programació ESO' } }) ||
    prisma.plantilla.create({
      data: {
        nom: 'Programació ESO',
        descripcio: 'Plantilla estàndard per a programacions d\'ESO',
        estructuraJSON: JSON.stringify({
          seccions: [
            'introduccio',
            'objectius',
            'continguts',
            'criterisAvaluacio',
            'competencies',
            'unitatsDidactiques',
            'metodologia',
            'atencioDiversitat',
            'avaluacio',
          ],
        }),
      },
    })

  await prisma.plantilla.findFirst({ where: { nom: 'Programació Batxillerat' } }) ||
    prisma.plantilla.create({
      data: {
        nom: 'Programació Batxillerat',
        descripcio: 'Plantilla estàndard per a programacions de Batxillerat',
        estructuraJSON: JSON.stringify({
          seccions: [
            'introduccio',
            'objectius',
            'continguts',
            'criterisAvaluacio',
            'competencies',
            'unitatsDidactiques',
            'metodologia',
            'atencioDiversitat',
            'avaluacio',
          ],
        }),
      },
    })
  console.log('✅ Plantilles creades')

  // Seed 4t ESO Matemàtiques Aplicades programació
  try {
    const { seed4tma } = await import('../scripts/seed-4tma')
    await seed4tma(prisma as any)
    console.log('✅ Seed 4tMA executat des de prisma/seed.ts')
  } catch (err) {
    console.error('⚠️ Error executant seed 4tMA:', err)
  }

  // Seed 2n Batx Matemàtiques Aplicades a les Ciències Socials programació
  try {
    const { seed2nBatxCS } = await import('../scripts/seed-2nbatx-cs')
    await seed2nBatxCS(prisma as any)
    console.log('✅ Seed 2n Batx CS executat des de prisma/seed.ts')
  } catch (err) {
    console.error('⚠️ Error executant seed 2n Batx CS:', err)
  }

  console.log('🎉 Seed completat!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })