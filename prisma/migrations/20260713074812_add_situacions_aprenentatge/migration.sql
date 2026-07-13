-- CreateTable
CREATE TABLE "SituacioAprenentatge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titol" TEXT NOT NULL,
    "descripcio" TEXT,
    "competenciesEspecifiques" TEXT NOT NULL,
    "mesuresSuportsUniversals" TEXT NOT NULL,
    "activitatsInicials" TEXT NOT NULL,
    "activitatsDesenvolupament" TEXT NOT NULL,
    "activitatsEstructuracio" TEXT NOT NULL,
    "activitatsAplicacio" TEXT NOT NULL,
    "unitatDidacticaId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SituacioAprenentatge_unitatDidacticaId_fkey" FOREIGN KEY ("unitatDidacticaId") REFERENCES "UnitatDidactica" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
