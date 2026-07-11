import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Omplint criteris d\'avaluació...')

  // Criteris per a Matemàtiques I (1r Batxillerat)
  const matesI = await prisma.materia.findFirstOrThrow({ where: { codi: 'MatesI' } })
  const blocsMatesI = await prisma.bloc.findMany({ where: { materiaId: matesI.id } })

  const bl1 = blocsMatesI.find(b => b.codi === 'BL1')!
  const bl2 = blocsMatesI.find(b => b.codi === 'BL2')!
  const bl3 = blocsMatesI.find(b => b.codi === 'BL3')!
  const bl4 = blocsMatesI.find(b => b.codi === 'BL4')!
  const bl5 = blocsMatesI.find(b => b.codi === 'BL5')!

  // BL1 - Processos, mètodes i actituds
  const criterisBL1 = [
    { codi: 'BL1.1', descripcio: 'Interpretar textos orals amb contingut matemàtic del nivell educatiu, procedents de fonts diverses, utilitzant les estratègies de comprensió oral per a obtindre informació i aplicar-la en la reflexió sobre el contingut.', competencies: 'CCLI, CAA' },
    { codi: 'BL1.2', descripcio: 'Aplicar diferents estratègies, individualment o en grup, per a la realització de tasques, resolució de problemes o investigacions matemàtiques i la demostració de resultats en distints contextos.', competencies: 'CMCT, CAA' },
    { codi: 'BL1.3', descripcio: 'Expressar oralment textos prèviament planificats de contingut matemàtic, amb una pronunciació clara, aplicant les normes de la prosòdia i la correcció gramatical.', competencies: 'CCLI, CMCT' },
    { codi: 'BL1.4', descripcio: 'Participar en intercanvis comunicatius de l\'àmbit personal, acadèmic, social o professional aplicant les estratègies lingüístiques i no lingüístiques.', competencies: 'CCLI, CAA' },
    { codi: 'BL1.5', descripcio: 'Reconéixer la terminologia conceptual de les matemàtiques adequades al nivell educatiu i utilitzar-la correctament en activitats orals i escrites.', competencies: 'CMCT, CCLI' },
    { codi: 'BL1.6', descripcio: 'Llegir textos continus o discontinus, enunciats de problemes, demostracions i xicotetes investigacions matemàtiques, utilitzant les estratègies de comprensió lectora.', competencies: 'CCLI, CAA' },
    { codi: 'BL1.7', descripcio: 'Escriure textos de l\'àmbit personal, acadèmic, social o professional en diversos formats i suports, cuidant els seus aspectes formals.', competencies: 'CCLI, CMCT' },
    { codi: 'BL1.8', descripcio: 'Buscar i seleccionar informació en diverses fonts de forma contrastada i organitzar la informació obtinguda per mitjà de diversos procediments de síntesi.', competencies: 'CD, CAA' },
    { codi: 'BL1.9', descripcio: 'Gestionar de manera eficaç tasques o projectes, fer propostes creatives i confiar en les seues possibilitats, prenent decisions raonades.', competencies: 'SIEE, CAA' },
    { codi: 'BL1.10', descripcio: 'Planificar tasques o projectes, individuals o col·lectius, descrivint accions, recursos materials, terminis i responsabilitats per a aconseguir els objectius proposats.', competencies: 'SIEE, CAA' },
    { codi: 'BL1.11', descripcio: 'Buscar i seleccionar informació sobre els entorns laborals, professions i estudis vinculats amb els coneixements del nivell educatiu.', competencies: 'SIEE, CAA' },
    { codi: 'BL1.12', descripcio: 'Organitzar un equip de treball distribuint responsabilitats i gestionant recursos perquè tots els seus membres participen i arriben a les metes comunes.', competencies: 'CSC, SIEE' },
    { codi: 'BL1.13', descripcio: 'Buscar i seleccionar informació a partir d\'una estratègia de filtratge i de manera contrastada en mitjans digitals.', competencies: 'CD, CMCT' },
    { codi: 'BL1.14', descripcio: 'Col·laborar i comunicar-se per a construir un producte o tasca col·lectiva filtrant i compartint informació i continguts digitals.', competencies: 'CD, CSC' },
    { codi: 'BL1.15', descripcio: 'Crear i editar continguts digitals com a documents de text, presentacions multimèdia i produccions audiovisuals amb sentit estètic.', competencies: 'CD, CMCT' },
  ]

  // BL2 - Nombres i àlgebra
  const criterisBL2 = [
    { codi: 'BL2.1', descripcio: 'Utilitzar els nombres reals i les seues operacions, amb els procediments més adequats (estimacions, representacions, detecció de patrons i regularitats), per a extraure conclusions sobre informacions numèriques en contextos científics.', competencies: 'CMCT, CD, CAA' },
    { codi: 'BL2.2', descripcio: 'Operar amb els nombres complexos per a resoldre situacions algebraiques en contextos acadèmics.', competencies: 'CMCT' },
    { codi: 'BL2.3', descripcio: 'Manipular el llenguatge algebraic en polinomis, fraccions algebraiques, equacions, sistemes d\'equacions, inequacions i funcions amb els procediments més adequats, per a resoldre situacions d\'àmbit científic.', competencies: 'CMCT, CD, CAA' },
  ]

  // BL3 - Anàlisi
  const criterisBL3 = [
    { codi: 'BL3.1', descripcio: 'Analitzar models funcionals (polinòmiques, racionals, logarítmics, exponencials) expressats en forma algebraica, per mitjà de taules o gràficament, utilitzant les ferramentes adequades, per a descriure fenòmens en contextos personals, socials, professionals i científics.', competencies: 'CMCT, CD, CSC' },
    { codi: 'BL3.2', descripcio: 'Descriure processos de canvi aplicant els conceptes i el càlcul de límits, taxes de variació mitjana i derivades en contextos acadèmics i científics.', competencies: 'CMCT' },
    { codi: 'BL3.3', descripcio: 'Aplicar el càlcul de límits (en un punt i en infinit) i derivades (regles de derivació) de funcions senzilles, per a representar-les per mitjà de l\'estudi de propietats locals i globals.', competencies: 'CMCT' },
  ]

  // BL4 - Geometria
  const criterisBL4 = [
    { codi: 'BL4.1', descripcio: 'Aplicar fórmules trigonomètriques (teoremes del sinus, cosinus, tangent i les equacions fonamentals de la trigonometria) utilitzant unitats i ferramentes tecnològiques adequades, per a resoldre situacions de mesura en contextos científics.', competencies: 'CMCT, CD' },
    { codi: 'BL4.2', descripcio: 'Utilitzar els elements de la geometria analítica plana (vectors, bases, equacions de la recta) i les seues propietats (paral·lelisme, perpendicularitat) i operacions per a resoldre situacions geomètriques en contextos acadèmics.', competencies: 'CMCT' },
    { codi: 'BL4.3', descripcio: 'Identificar les formes corresponents a alguns llocs geomètrics usuals, estudiant les seues equacions i analitzant les seues propietats mètriques per a resoldre situacions geomètriques en contextos acadèmics.', competencies: 'CMCT' },
  ]

  // BL5 - Estadística i probabilitat
  const criterisBL5 = [
    { codi: 'BL5.1', descripcio: 'Analitzar distribucions bidimensionals per mitjà dels paràmetres estadístics més usuals, el coeficient de correlació i la recta de regressió, amb les ferramentes tecnològiques més adequades, per a prendre decisions en contextos científics.', competencies: 'CMCT, CD, CAA' },
  ]

  // Inserir criteris
  const totsCriteris = [
    ...criterisBL1.map(c => ({ ...c, blocId: bl1.id })),
    ...criterisBL2.map(c => ({ ...c, blocId: bl2.id })),
    ...criterisBL3.map(c => ({ ...c, blocId: bl3.id })),
    ...criterisBL4.map(c => ({ ...c, blocId: bl4.id })),
    ...criterisBL5.map(c => ({ ...c, blocId: bl5.id })),
  ]

  // Eliminar criteris existents i crear de nous
  await prisma.criteriAvaluacio.deleteMany({ where: { blocId: { in: blocsMatesI.map(b => b.id) } } })
  await prisma.criteriAvaluacio.createMany({ data: totsCriteris })
  console.log(`✅ ${totsCriteris.length} criteris d'avaluació creats per a Matemàtiques I`)

  // Ara omplir criteris per a la resta de matèries (ESO)
  const materiesESO = await prisma.materia.findMany({
    where: { codi: { in: ['Mates1rESO', 'Mates2nESO', 'Mates3rESO', 'Mates4tAcad', 'Mates4tApl'] } },
  })

  for (const materia of materiesESO) {
    const blocs = await prisma.bloc.findMany({ where: { materiaId: materia.id } })
    
    // Criteris bàsics per a ESO (versió simplificada)
    const criterisESO = [
      { codi: 'BL1.1', descripcio: 'Interpretar textos orals amb contingut matemàtic del nivell educatiu.', competencies: 'CCLI, CAA' },
      { codi: 'BL1.2', descripcio: 'Aplicar diferents estratègies per a la resolució de problemes en distints contextos.', competencies: 'CMCT, CAA' },
      { codi: 'BL2.1', descripcio: 'Interpretar els nombres naturals, enters, fraccionaris, decimals i percentatges, i utilitzar-los en situacions quotidianes.', competencies: 'CMCT, CSC' },
      { codi: 'BL2.2', descripcio: 'Operar amb nombres amb estratègies de càlcul mental, estimació i procediments adequats.', competencies: 'CMCT, CAA' },
      { codi: 'BL3.1', descripcio: 'Analitzar les característiques i propietats de les figures planes utilitzant ferramentes adequades.', competencies: 'CMCT, CD, CEC' },
      { codi: 'BL3.2', descripcio: 'Mesurar i calcular angles, longituds i superfícies en el pla.', competencies: 'CMCT, CD, CAA' },
      { codi: 'BL4.1', descripcio: 'Interpretar relacions numèriques expressades en llenguatge verbal, taula o gràfica.', competencies: 'CMCT, CSC' },
      { codi: 'BL5.1', descripcio: 'Analitzar dades estadístiques de fenòmens socials, econòmics o relacionats amb la naturalesa.', competencies: 'CMCT, CAA, CSC' },
      { codi: 'BL5.2', descripcio: 'Analitzar el comportament de fenòmens aleatoris per mitjà de la realització d\'experiments senzills.', competencies: 'CMCT, CAA' },
    ]

    // Eliminar criteris existents i crear de nous
    await prisma.criteriAvaluacio.deleteMany({ where: { blocId: { in: blocs.map(b => b.id) } } })
    for (const criteri of criterisESO) {
      const bloc = blocs.find(b => b.codi === criteri.codi.split('.')[0])
      if (bloc) {
        await prisma.criteriAvaluacio.create({ data: { ...criteri, blocId: bloc.id } })
      }
    }
    console.log(`✅ Criteris creats per a ${materia.nom}`)
  }

  console.log('🎉 Criteris d\'avaluació completats!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())