#!/bin/bash

# Script per crear la programació de Matemàtiques I via API
BASE_URL="http://localhost:3000/api"

# Primer fem login per obtindre la cookie de sessió
echo "Iniciant sessió..."
curl -s -c /tmp/cookies.txt -X POST "$BASE_URL/auth/callback/credentials?" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@institut.edu","password":"admin123","csrfToken":"dummy"}' > /dev/null

# Crear la programació
echo "Creant programació..."
PROG_RESPONSE=$(curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/programacions" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Programació Didàctica de Matemàtiques I - 1r Batxillerat",
    "descripcio": "Programació didàctica de Matemàtiques I per a 1r de Batxillerat, basada en el Decret 108/2022 de la Comunitat Valenciana. Curs 2026/2027.",
    "cursEscolarId": "cmrgp4ox30003chbcpjsosg1x",
    "nivellId": "cmrgp4ox70008chbcek1eygkn",
    "materiaId": "cmrgp4oxt000lchbc53kul4tf"
  }')

PROG_ID=$(echo $PROG_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Programació creada amb ID: $PROG_ID"

# Crear unitats didàctiques
echo "Creant unitats didàctiques..."

# U1: Nombres reals i successions
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Nombres reals i successions",
    "temporitzacio": "14 sessions",
    "objectius": "1. Classificar els diferents tipus de nombres reals. 2. Representar i ordenar nombres a la recta real. 3. Calcular valor absolut, intervals i entorns. 4. Realitzar aproximacions i càlcul d'\''errors. 5. Utilitzar la notació científica. 6. Definir i calcular logaritmes decimals i neperians. 7. Identificar successions numèriques, terme general i monotonia.",
    "continguts": "Nombres reals: estudi per a la comprensió de la realitat. Valor absolut. Desigualtats. Distàncies en la recta real. Intervals i entorns. Aproximació i errors. Notació científica. Logaritmes decimals i neperians. Successions numèriques: terme general, monotonia i acotació. El nombre e.",
    "criterisAvaluacio": "BL2.1 Utilitzar els nombres reals i les seues operacions per a extraure conclusions sobre informacions numèriques en contextos científics.",
    "programacioId": "'$PROG_ID'",
    "ordre": 1
  }' > /dev/null
echo "  ✅ U1 creada"

# U2: Nombres complexos
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Nombres complexos",
    "temporitzacio": "8 sessions",
    "objectius": "1. Comprendre la necessitat dels nombres complexos. 2. Representar nombres complexos en forma binòmica i polar. 3. Operar amb nombres complexos. 4. Aplicar la fórmula de Moivre.",
    "continguts": "Nombres complexos. Forma binòmica i polar. Representacions gràfiques. Operacions elementals. Fórmula de Moivre.",
    "criterisAvaluacio": "BL2.2 Operar amb els nombres complexos per a resoldre situacions algebraiques en contextos acadèmics.",
    "programacioId": "'$PROG_ID'",
    "ordre": 2
  }' > /dev/null
echo "  ✅ U2 creada"

# U3: Àlgebra i equacions
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Àlgebra: equacions, inequacions i sistemes",
    "temporitzacio": "14 sessions",
    "objectius": "1. Resoldre equacions logarítmiques i exponencials. 2. Resoldre equacions no algebraiques senzilles. 3. Resoldre inequacions i interpretar-les gràficament. 4. Resoldre sistemes d'\''equacions lineals pel mètode de Gauss. 5. Aplicar les tècniques algebraiques a la resolució de problemes.",
    "continguts": "Equacions logarítmiques i exponencials. Resolució d'\''equacions i inequacions. Interpretació gràfica. Resolució d'\''equacions no algebraiques senzilles. Resolució i interpretació de sistemes d'\''equacions lineals. Mètode de Gauss. Resolució de problemes per mitjà d'\''equacions, inequacions i sistemes.",
    "criterisAvaluacio": "BL2.3 Manipular el llenguatge algebraic en polinomis, fraccions algebraiques, equacions, sistemes d'\''equacions, inequacions i funcions per a resoldre situacions d'\''àmbit científic.",
    "programacioId": "'$PROG_ID'",
    "ordre": 3
  }' > /dev/null
echo "  ✅ U3 creada"

# U4: Funcions i límits
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Funcions reals, límits i continuïtat",
    "temporitzacio": "14 sessions",
    "objectius": "1. Identificar i representar funcions bàsiques. 2. Realitzar operacions i composició de funcions. 3. Calcular la funció inversa. 4. Calcular límits d'\''una funció en un punt i en l'\''infinit. 5. Estudiar la continuïtat d'\''una funció i classificar discontinuïtats.",
    "continguts": "Funcions reals de variable real. Funcions bàsiques: polinòmiques, racionals senzilles, valor absolut, arrel, trigonomètriques, exponencials, logarítmiques i funcions definides a trossos. Operacions i composició de funcions. Funció inversa. Concepte de límit d'\''una funció en un punt i en l'\''infinit. Càlcul de límits. Límits laterals. Indeterminacions. Continuïtat d'\''una funció. Estudi de discontinuïtats.",
    "criterisAvaluacio": "BL3.1 Analitzar models funcionals expressats en forma algebraica, per mitjà de taules o gràficament, per a descriure fenòmens en contextos personals, socials, professionals i científics.",
    "programacioId": "'$PROG_ID'",
    "ordre": 4
  }' > /dev/null
echo "  ✅ U4 creada"

# U5: Derivades
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Derivades i aplicacions",
    "temporitzacio": "14 sessions",
    "objectius": "1. Calcular la derivada d'\''una funció en un punt. 2. Interpretar geomètricament la derivada. 3. Calcular la recta tangent i normal. 4. Aplicar la regla de la cadena. 5. Representar gràficament funcions després d'\''un estudi complet.",
    "continguts": "Derivada d'\''una funció en un punt. Interpretació geomètrica de la derivada de la funció en un punt. Recta tangent i normal. Funció derivada. Càlcul de derivades. Regla de la cadena. Representació gràfica de funcions, després d'\''un estudi complet de les seues característiques per mitjà de les ferramentes bàsiques de l'\''anàlisi.",
    "criterisAvaluacio": "BL3.2 Descriure processos de canvi aplicant els conceptes i el càlcul de límits, taxes de variació mitjana i derivades en contextos acadèmics i científics. BL3.3 Aplicar el càlcul de límits i derivades per a representar funcions per mitjà de l'\''estudi de propietats locals i globals.",
    "programacioId": "'$PROG_ID'",
    "ordre": 5
  }' > /dev/null
echo "  ✅ U5 creada"

# U6: Trigonometria
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Trigonometria",
    "temporitzacio": "12 sessions",
    "objectius": "1. Mesurar angles en radians. 2. Calcular raons trigonomètriques d'\''un angle qualsevol. 3. Aplicar les fórmules de transformacions trigonomètriques. 4. Resoldre triangles utilitzant els teoremes del sinus, cosinus i tangent. 5. Resoldre equacions trigonomètriques senzilles.",
    "continguts": "Mesura d'\''un angle en radians. Raons trigonomètriques d'\''un angle qualsevol. Raons trigonomètriques dels angles suma, diferència, doble i meitat. Fórmules de transformacions trigonomètriques. Teoremes del sinus, del cosinus i de la tangent. Resolució de triangles. Resolució d'\''equacions trigonomètriques senzilles.",
    "criterisAvaluacio": "BL4.1 Aplicar fórmules trigonomètriques utilitzant unitats i ferramentes tecnològiques adequades per a resoldre situacions de mesura en contextos científics.",
    "programacioId": "'$PROG_ID'",
    "ordre": 6
  }' > /dev/null
echo "  ✅ U6 creada"

# U7: Geometria analítica plana
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Geometria analítica plana i còniques",
    "temporitzacio": "14 sessions",
    "objectius": "1. Operar amb vectors lliures en el pla. 2. Calcular el producte escalar, mòdul i angle de vectors. 3. Treballar amb bases ortogonals i ortonormals. 4. Determinar equacions de la recta i posicions relatives. 5. Calcular distàncies i angles. 6. Identificar i estudiar còniques.",
    "continguts": "Vectors lliures en el pla. Operacions geomètriques. Producte escalar. Mòdul d'\''un vector. Angle de dos vectors. Bases ortogonals i ortonormals. Geometria mètrica plana. Equacions de la recta. Posicions relatives de rectes. Distàncies i angles. Llocs geomètrics del pla. Còniques: circumferència, el·lipse, hipèrbola i paràbola. Equació i elements.",
    "criterisAvaluacio": "BL4.2 Utilitzar els elements de la geometria analítica plana i les seues propietats per a resoldre situacions geomètriques en contextos acadèmics. BL4.3 Identificar les formes corresponents a alguns llocs geomètrics usuals.",
    "programacioId": "'$PROG_ID'",
    "ordre": 7
  }' > /dev/null
echo "  ✅ U7 creada"

# U8: Estadística bidimensional
curl -s -b /tmp/cookies.txt -X POST "$BASE_URL/unitats" \
  -H "Content-Type: application/json" \
  -d '{
    "titol": "Estadística bidimensional i probabilitat",
    "temporitzacio": "10 sessions",
    "objectius": "1. Construir taules de contingència i distribucions marginals. 2. Calcular mitjanes i desviacions típiques marginals. 3. Analitzar la dependència entre variables estadístiques. 4. Calcular i interpretar el coeficient de correlació lineal. 5. Realitzar prediccions mitjançant la regressió lineal.",
    "continguts": "Estadística descriptiva bidimensional: taules de contingència. Distribució conjunta i distribucions marginals. Mitjanes i desviacions típiques marginals. Distribucions condicionades. Independència de variables estadístiques. Estudi de la dependència de dues variables estadístiques. Representació gràfica: núvol de punts. Dependència lineal. Covariància i correlació. Coeficient de correlació lineal. Regressió lineal. Estimació. Prediccions estadístiques i fiabilitat.",
    "criterisAvaluacio": "BL5.1 Analitzar distribucions bidimensionals per mitjà dels paràmetres estadístics més usuals, el coeficient de correlació i la recta de regressió, per a prendre decisions en contextos científics.",
    "programacioId": "'$PROG_ID'",
    "ordre": 8
  }' > /dev/null
echo "  ✅ U8 creada"

echo ""
echo "✅ Programació de Matemàtiques I completada!"
echo "   Total: 8 unitats didàctiques"
echo "   Accedeix a http://localhost:3000/programacions/$PROG_ID per veure-la"