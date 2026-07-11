import type { PrismaClient } from '@prisma/client'
// Exported function so this seed can be composed into prisma/seed.ts
export async function seed4tma(prisma: PrismaClient) {
  // Ensure Nivell
  const nivell = await prisma.nivell.upsert({
    where: { codi: '4tESO' },
    update: { nom: "4t d'ESO" },
    create: { codi: '4tESO', nom: "4t d'ESO" },
  })

  // Ensure Materia (codi is not unique in schema, so do find/create)
  let materia = await prisma.materia.findFirst({ where: { codi: 'MatAplic' } })
  if (!materia) {
    materia = await prisma.materia.create({ data: { codi: 'MatAplic', nom: 'Matemàtiques Aplicades', nivellId: nivell.id } })
  } else {
    materia = await prisma.materia.update({ where: { id: materia.id }, data: { nom: 'Matemàtiques Aplicades', nivellId: nivell.id } })
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

  // Create Programacio
  let programacio = await prisma.programacio.findFirst({ where: { titol: 'Matemàtiques Aplicades 4t ESO - Programació didàctica' } })
  if (!programacio) {
    programacio = await prisma.programacio.create({
      data: {
        titol: 'Matemàtiques Aplicades 4t ESO - Programació didàctica',
        descripcio: 'Programació didàctica per a 4t d\'ESO - Matemàtiques Aplicades (CV).',
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
      titol: 'Funcions i modelització',
      temporitzacio: '12 sessions',
      objectius: 'Identificar i utilitzar funcions reals per modelitzar situacions reals; interpretar gràfics i parameters.',
      continguts: 'Funcions lineals, afins, polinòmiques i exponencials; representació; interpretació en contextos aplicats.',
      criterisAvaluacio: 'Utilitzar models funcionals per resoldre problemes contextualitzats; interpretar gràfics i paràmetres.',
    },
    {
      titol: 'Equacions i models aplicats',
      temporitzacio: '10 sessions',
      objectius: 'Resoldre equacions i sistemes que modelitzen problemes reals; avaluar solucions.',
      continguts: 'Equacions lineals i senzilles, sistemes, anàlisi d\'errors i aproximacions.',
      criterisAvaluacio: 'Resoldre i interpretar solucions d\'equacions aplicades a situacions reals.',
    },
    {
      titol: 'Successions i aplicacions',
      temporitzacio: '8 sessions',
      objectius: 'Analitzar successions i progressions; aplicar-les a models discrets.',
      continguts: 'Progressions aritmètiques i geomètriques; terme general; aplicacions.',
      criterisAvaluacio: 'Identificar i aplicar progressions per modelitzar i resoldre problemes.',
    },
    {
      titol: 'Estadística i probabilitat',
      temporitzacio: '12 sessions',
      objectius: 'Recollir, representar i interpretar dades; calcular probabilitats en situacions reals.',
      continguts: 'Mostreig, mesures de tendència, dispersió, probabilitat elemental i models simples.',
      criterisAvaluacio: 'Analitzar dades i utilitzar probabilitat per a prediccions senzilles i presa de decisions.',
    },
    {
      titol: 'Matemàtica financera',
      temporitzacio: '6 sessions',
      objectius: 'Calcular interessos, rendibilitats i amortitzacions bàsiques; interpretar informació financera.',
      continguts: 'Interès simple i compost, anualitats, préstecs i amortitzacions.',
      criterisAvaluacio: 'Resoldre problemes financers bàsics aplicant fórmules d\'interès i amortització.',
    },
    {
      titol: 'Geometria i trigonometria aplicada',
      temporitzacio: '10 sessions',
      objectius: 'Aplicar geometria i trigonometria a situacions reals; utilitzar vectors i coordenades.',
      continguts: 'Vectors, distàncies, angles, aplicacions pràctiques i trigonometria bàsica.',
      criterisAvaluacio: 'Utilitzar eines geomètriques i trigonomètriques per a resoldre problemes pràctics.',
    },
  ]

  // Create Blocs and Criteris for the materia
  const blocsData = [
    { codi: 'BL1', nom: 'Processos, mètodes i actituds', criteris: [
      { codi: 'BL1.1', descripcio: 'Utilitzar estratègies matemàtiques per resoldre problemes.' },
      { codi: 'BL1.2', descripcio: 'Argumentar i justificar solucions amb raonament matemàtic.' },
    ]},
    { codi: 'BL2', nom: 'Nombres i àlgebra', criteris: [
      { codi: 'BL2.1', descripcio: 'Aplicar models algebraics per representar situacions.' },
      { codi: 'BL2.2', descripcio: 'Manipular expressions i resoldre equacions senzilles.' },
    ]},
    { codi: 'BL3', nom: 'Geometria i mesura', criteris: [
      { codi: 'BL3.1', descripcio: 'Utilitzar eines geomètriques per resoldre problemes reals.' },
      { codi: 'BL3.2', descripcio: 'Calcular distàncies, àrees i angles en contexts pràctics.' },
    ]},
    { codi: 'BL4', nom: 'Funcions i canvi', criteris: [
      { codi: 'BL4.1', descripcio: 'Interpretar i utilitzar funcions per modelitzar fenòmens reals.' },
      { codi: 'BL4.2', descripcio: 'Analitzar gràfics i paràmetres de funcions.' },
    ]},
    { codi: 'BL5', nom: 'Atzar i estadística', criteris: [
      { codi: 'BL5.1', descripcio: 'Recollir i interpretar dades estadístiques bàsiques.' },
      { codi: 'BL5.2', descripcio: 'Calcular probabilitats en situacions simples.' },
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
      // ensure unique by codi + blocId
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
    // pick some sample related blocs/criteris depending on unit title
    const relatedBlocs = [] as string[]
    const relatedCriteris: string[] = []
    if (u.titol.match(/Funcions|modelització/i)) {
      relatedBlocs.push('BL4')
      relatedCriteris.push(...criterisMap['BL4'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else if (u.titol.match(/Equacions/i)) {
      relatedBlocs.push('BL2')
      relatedCriteris.push(...criterisMap['BL2'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else if (u.titol.match(/Successions/i)) {
      relatedBlocs.push('BL2')
      relatedCriteris.push(criterisMap['BL2'][0] ? `${criterisMap['BL2'][0].codi} - ${criterisMap['BL2'][0].descripcio}` : '')
    } else if (u.titol.match(/Estadística|probabilitat/i)) {
      relatedBlocs.push('BL5')
      relatedCriteris.push(...criterisMap['BL5'].map((c: any) => `${c.codi} - ${c.descripcio}`))
    } else if (u.titol.match(/financ/i)) {
      relatedBlocs.push('BL2')
      relatedCriteris.push(criterisMap['BL2'][0] ? `${criterisMap['BL2'][0].codi} - ${criterisMap['BL2'][0].descripcio}` : '')
    } else if (u.titol.match(/Geometria|trigonometria/i)) {
      relatedBlocs.push('BL3')
      relatedCriteris.push(...criterisMap['BL3'].map((c: any) => `${c.codi} - ${c.descripcio}`))
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

// Allow running this script directly with `npx tsx scripts/seed-4tma.ts`
if (require.main === module) {
  import('@prisma/client').then(({ PrismaClient }) => {
    const prisma = new PrismaClient()
    seed4tma(prisma)
      .catch((e) => {
        console.error(e)
        process.exit(1)
      })
      .finally(() => prisma.$disconnect())
  }).catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
