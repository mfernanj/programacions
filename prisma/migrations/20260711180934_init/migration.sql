-- CreateTable
CREATE TABLE "Usuari" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'membre',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CursEscolar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anyInici" INTEGER NOT NULL,
    "anyFi" INTEGER NOT NULL,
    "actiu" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Nivell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codi" TEXT NOT NULL,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codi" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nivellId" TEXT NOT NULL,
    CONSTRAINT "Materia_nivellId_fkey" FOREIGN KEY ("nivellId") REFERENCES "Nivell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bloc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codi" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    CONSTRAINT "Bloc_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contingut" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descripcio" TEXT NOT NULL,
    "curs" TEXT NOT NULL,
    "blocId" TEXT NOT NULL,
    CONSTRAINT "Contingut_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CriteriAvaluacio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codi" TEXT NOT NULL,
    "descripcio" TEXT NOT NULL,
    "competencies" TEXT NOT NULL,
    "blocId" TEXT NOT NULL,
    CONSTRAINT "CriteriAvaluacio_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Programacio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT,
    "cursEscolarId" TEXT NOT NULL,
    "nivellId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "estat" TEXT NOT NULL DEFAULT 'esborrany',
    "versio" INTEGER NOT NULL DEFAULT 1,
    "autorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Programacio_cursEscolarId_fkey" FOREIGN KEY ("cursEscolarId") REFERENCES "CursEscolar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Programacio_nivellId_fkey" FOREIGN KEY ("nivellId") REFERENCES "Nivell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Programacio_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Programacio_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuari" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitatDidactica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titol" TEXT NOT NULL,
    "temporitzacio" TEXT NOT NULL,
    "objectius" TEXT NOT NULL,
    "continguts" TEXT NOT NULL,
    "criterisAvaluacio" TEXT,
    "competencies" TEXT,
    "activitats" TEXT,
    "programacioId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UnitatDidactica_programacioId_fkey" FOREIGN KEY ("programacioId") REFERENCES "Programacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metodologia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estrategies" TEXT NOT NULL,
    "recursos" TEXT NOT NULL,
    "agrupaments" TEXT NOT NULL,
    "avaluacio" TEXT,
    "programacioId" TEXT NOT NULL,
    CONSTRAINT "Metodologia_programacioId_fkey" FOREIGN KEY ("programacioId") REFERENCES "Programacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AtencioDiversitat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mesuresGenerals" TEXT NOT NULL,
    "mesuresEspecifiques" TEXT,
    "adaptacions" TEXT,
    "programacioId" TEXT NOT NULL,
    CONSTRAINT "AtencioDiversitat_programacioId_fkey" FOREIGN KEY ("programacioId") REFERENCES "Programacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Examen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT,
    "cursEscolarId" TEXT NOT NULL,
    "nivellId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "avaluacio" TEXT NOT NULL,
    "tipus" TEXT NOT NULL DEFAULT 'examen',
    "dificultat" TEXT NOT NULL DEFAULT 'mitja',
    "fitxerPath" TEXT,
    "etiquetes" TEXT,
    "autorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Examen_cursEscolarId_fkey" FOREIGN KEY ("cursEscolarId") REFERENCES "CursEscolar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Examen_nivellId_fkey" FOREIGN KEY ("nivellId") REFERENCES "Nivell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Examen_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Examen_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuari" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plantilla" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "descripcio" TEXT,
    "estructuraJSON" TEXT NOT NULL,
    "nivellId" TEXT,
    "materiaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VersioProgramacio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programacioId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canvis" TEXT NOT NULL,
    "contingutJSON" TEXT,
    "autorId" TEXT NOT NULL,
    CONSTRAINT "VersioProgramacio_programacioId_fkey" FOREIGN KEY ("programacioId") REFERENCES "Programacio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VersioProgramacio_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuari" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuari_email_key" ON "Usuari"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Nivell_codi_key" ON "Nivell"("codi");

-- CreateIndex
CREATE UNIQUE INDEX "Metodologia_programacioId_key" ON "Metodologia"("programacioId");

-- CreateIndex
CREATE UNIQUE INDEX "AtencioDiversitat_programacioId_key" ON "AtencioDiversitat"("programacioId");

-- CreateIndex
CREATE UNIQUE INDEX "VersioProgramacio_programacioId_numero_key" ON "VersioProgramacio"("programacioId", "numero");
