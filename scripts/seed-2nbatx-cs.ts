import type { PrismaClient } from '@prisma/client'

// Exported function so this seed can be composed into prisma/seed.ts
export async function seed2nBatxCS(prisma: PrismaClient) {
  // Ensure Nivell
  const nivell = await prisma.nivell.upsert({
    where: { codi: '2nBatx' },
    update: { nom: '2n de Batxillerat' },
    create: { codi: '2nBatx', nom: '2n de Batxillerat' },
  })

  // Ensure Materia
  let materia = await prisma.materia.findFirst({ where: { codi: 'MatesAplCS' } })
  if (!materia) {
    materia = await prisma.materia.create({ data: { codi: 'MatesAplCS', nom: 'Matemàtiques Aplicades a les Ciències Socials', nivellId: nivell.id } })
  } else {
    materia = await prisma.materia.update({ where: { id: materia.id }, data: { nom: 'Matemàtiques Aplicades a les Ciències Socials', nivellId: nivell.id } })
  }

  // Ensure CursEscolar (use current year)
  const now = new Date()
  const year = now.getFullYear()
  let curs = await prisma.cursEscolar.findFirst({ where: { anyInici: year } })
  if (!curs) {
    curs = await prisma.cursEscolar.create({ data: { anyInici: year, anyFi: year + 1, actiu: true } })
  } else {
    curs = await prisma.cursEscolar.update({ where: { id: curs.id }, data: { anyFi: year + 1, actiu: true } })
  }

  let programacio = await prisma.programacio.findFirst({ where: { titol: 'Matemàtiques Aplicades a les Ciències Socials 2n Batxillerat - Programació didàctica' } })
  if (!programacio) {
    programacio = await prisma.programacio.create({
      data: {
        titol: 'Matemàtiques Aplicades a les Ciències Socials 2n Batxillerat - Programació didàctica',
        descripcio: 'Programació didàctica per a 2n de Batxillerat - Matemàtiques Aplicades a les Ciències Socials.',
        cursEscolarId: curs.id,
        nivellId: nivell.id,
        materiaId: materia.id,
        estat: 'esborrany',
        versio: 1,
        autorId: (await prisma.usuari.findFirst())?.id || (await prisma.usuari.create({ data: { nom: 'Autor seed', email: 'seed@local', passwordHash: 'x' } })).id,
      },
    })
  }

  const unitats = [
    {
      titol: 'Matrius, sistemes i programació lineal',
      temporitzacio: '12 sessions',
      objectius: 'Ordenar informació social mitjançant matrius; resoldre sistemes lineals; aplicar la programació lineal a la presa de decisions.',
      continguts: 'Matrius, operacions, rang, inversa, mètode de Gauss, determinants fins a ordre 3, sistemes lineals, inequacions lineals, programació lineal bidimensional, regió factible i solucions òptimes.',
      criterisAvaluacio: 'BL2.1 Ordenar la informació de situacions de l’àmbit social amb el llenguatge matricial i les operacions amb matrius com a instrument per al tractament de la informació.',
    },
    {
      titol: 'Funcions, límits i continuïtat',
      temporitzacio: '10 sessions',
      objectius: 'Analitzar funcions elementals i la seva representació; calcular límits i estudiar la continuïtat per descriure fenòmens socials.',
      continguts: 'Funcions polinòmiques, racionals, exponencials i logarítmiques; funcions definides a trossos; límits i continuïtat; tipus de discontinuïtats; taxa de variació mitjana.',
      criterisAvaluacio: 'BL3.1 Aplicar els límits i l’estudi de la continuïtat de funcions per descriure el seu comportament i extreure conclusions en contextos acadèmics i socials.',
    },
    {
      titol: 'Derivades, integrals i aplicacions',
      temporitzacio: '12 sessions',
      objectius: 'Calcular derivades i integrals de funcions senzilles i utilitzar-les per analitzar taxes de variació i àrees en situacions socials.',
      continguts: 'Derivada en un punt, recta tangent, regles de derivació, primitives immediates, integral definida, regla de Barrow i càlcul d’àrees de regions planes limitades per rectes i corbes.',
      criterisAvaluacio: 'BL3.2 Calcular integrals immediates i aplicar la integral definida per a mesurar àrees en contextos acadèmics i socials.',
    },
    {
      titol: 'Probabilitat i estadística inferencial',
      temporitzacio: '12 sessions',
      objectius: 'Aplicar els conceptes de probabilitat, mostreig i inferència estadística per prendre decisions amb informació incompleta.',
      continguts: 'Probabilitat total i Bayes; població i mostra; mètodes de selecció de mostres; distribució de la mitjana mostral; intervals de confiança per a la mitjana i la proporció; errors i grandària mostral.',
      criterisAvaluacio: 'BL4.1 Assignar probabilitats i utilitzar teoremes de probabilitat en experiments per a la presa de decisions en contextos socials; BL4.2 Estimar paràmetres poblacionals construint intervals de confiança; BL4.3 Analitzar informes estadístics i detectar errors o manipulacions.',
    },
  ]

  const blocsData = [
    { codi: 'BL1', nom: 'Processos, mètodes i actituds en matemàtiques', criteris: [
      { codi: 'BL1.1', descripcio: 'Interpretar textos orals amb contingut matemàtic procedents de fonts diverses per obtindre informació i aplicar-la en la reflexió sobre el contingut.' },
      { codi: 'BL1.2', descripcio: 'Aplicar diferents estratègies per a la realització de tasques i la resolució de problemes matemàtics treballant individualment o en grup.' },
      { codi: 'BL1.3', descripcio: 'Escriure textos de caràcter matemàtic, com processos de resolució de problemes o informes, amb coherència i terminologia adequada.' },
    ]},
    { codi: 'BL2', nom: 'Nombres i àlgebra', criteris: [
      { codi: 'BL2.1', descripcio: 'Ordenar informació de situacions de l’àmbit social utilitzant el llenguatge matricial i les operacions amb matrius.' },
      { codi: 'BL2.2', descripcio: 'Manipular el llenguatge algebraic en matrius, sistemes d’equacions, inequacions i programació lineal per resoldre situacions de les ciències socials.' },
    ]},
    { codi: 'BL3', nom: 'Anàlisi', criteris: [
      { codi: 'BL3.1', descripcio: 'Aplicar el càlcul de límits i derivades de funcions per representar-les i extreure conclusions del seu comportament en contextos acadèmics i socials.' },
      { codi: 'BL3.2', descripcio: 'Calcular integrals utilitzant tècniques d’integració immediata per mesurar àrees de regions planes en contextos acadèmics i socials.' },
    ]},
    { codi: 'BL4', nom: 'Estadística i probabilitat', criteris: [
      { codi: 'BL4.1', descripcio: 'Assignar probabilitats a successos aleatoris utilitzant diferents tècniques i teoremes per a la presa de decisions en contextos socials.' },
      { codi: 'BL4.2', descripcio: 'Estimar paràmetres desconeguts d’una població amb intervals de confiança i errors prefixats.' },
      { codi: 'BL4.3', descripcio: 'Analitzar informes estadístics per detectar errors i manipulacions en la seua presentació i conclusions.' },
    ]},
  ]

  const blocMap: Record<string, any> = {}
  const criterisMap: Record<string, Array<any>> = {}
  for (const b of blocsData) {
    let bloc = await prisma.bloc.findFirst({ where: { codi: b.codi, materiaId: materia.id } })
    if (!bloc) {
      bloc = await prisma.bloc.create({ data: { codi: b.codi, nom: b.nom, materiaId: materia.id } })
    } else {
      bloc = await prisma.bloc.update({ where: { id: bloc.id }, data: { nom: b.nom } })
    }
    blocMap[b.codi] = bloc
    criterisMap[b.codi] = []
    for (const c of b.criteris) {
      let crit = await prisma.criteriAvaluacio.findFirst({ where: { codi: c.codi, blocId: bloc.id } })
      if (!crit) {
        crit = await prisma.criteriAvaluacio.create({ data: { codi: c.codi, descripcio: c.descripcio, competencies: '', blocId: bloc.id } })
      } else {
        crit = await prisma.criteriAvaluacio.update({ where: { id: crit.id }, data: { descripcio: c.descripcio } })
      }
      criterisMap[b.codi].push(crit)
    }
  }

  let ordre = 1
  for (const u of unitats) {
    const relatedCriteris: string[] = []
    if (u.titol.match(/Matrius|sistemes|programació lineal/i)) {
      relatedCriteris.push(...criterisMap['BL2'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else if (u.titol.match(/Funcions|continuitat|límits/i)) {
      relatedCriteris.push(...criterisMap['BL3'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else if (u.titol.match(/Derivades|integrals/i)) {
      relatedCriteris.push(...criterisMap['BL3'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else if (u.titol.match(/Probabilitat|estadística/i)) {
      relatedCriteris.push(...criterisMap['BL4'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else {
      relatedCriteris.push(...criterisMap['BL1'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    }

    const combinedCriteris = [u.criterisAvaluacio, relatedCriteris.join('\n')].filter(Boolean).join('\n\n')

    await prisma.unitatDidactica.create({
      data: {
        titol: u.titol,
        temporitzacio: u.temporitzacio,
        objectius: u.objectius,
        continguts: u.continguts,
        criterisAvaluacio: combinedCriteris,
        programacioId: programacio.id,
        ordre: ordre++,
      },
    })
  }

  console.log('Seed complete. Programacio id:', programacio.id)
}

// Allow running this script directly with `npx tsx scripts/seed-2nbatx-cs.ts`
if (require.main === module) {
  import('@prisma/client').then(({ PrismaClient }) => {
    const prisma = new PrismaClient()
    seed2nBatxCS(prisma)
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
      .finally(() => prisma.$disconnect())
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })}