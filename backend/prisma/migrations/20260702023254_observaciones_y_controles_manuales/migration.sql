-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoDecision" ADD VALUE 'BLOQUEAR_ACTIVIDAD';
ALTER TYPE "TipoDecision" ADD VALUE 'DESBLOQUEAR_ACTIVIDAD';

-- CreateTable
CREATE TABLE "ObservacionTerapeuta" (
    "id" TEXT NOT NULL,
    "ninoId" TEXT NOT NULL,
    "terapeutaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservacionTerapeuta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ObservacionTerapeuta" ADD CONSTRAINT "ObservacionTerapeuta_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservacionTerapeuta" ADD CONSTRAINT "ObservacionTerapeuta_terapeutaId_fkey" FOREIGN KEY ("terapeutaId") REFERENCES "Terapeuta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
