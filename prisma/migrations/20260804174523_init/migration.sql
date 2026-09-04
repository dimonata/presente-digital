-- CreateTable
CREATE TABLE "Presente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeComprador" TEXT NOT NULL,
    "nomePresenteado" TEXT NOT NULL,
    "dataInicioNamoro" TEXT NOT NULL,
    "textoPoema" TEXT NOT NULL,
    "idMusicaSpotify" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "legenda" TEXT NOT NULL,
    "presenteId" TEXT NOT NULL,
    CONSTRAINT "Foto_presenteId_fkey" FOREIGN KEY ("presenteId") REFERENCES "Presente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
