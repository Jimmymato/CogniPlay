-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('TERAPEUTA', 'NINO');

-- CreateEnum
CREATE TYPE "NivelDificultad" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "NombreFuncionEjecutiva" AS ENUM ('RAZONAMIENTO', 'FLEXIBILIDAD_COGNITIVA', 'INHIBICION', 'TOMA_DECISIONES', 'ESTIMACION_TEMPORAL', 'EJECUCION_DUAL', 'BRANCHING');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('EN_CURSO', 'COMPLETADA', 'ABANDONADA');

-- CreateEnum
CREATE TYPE "TipoDecision" AS ENUM ('AUMENTAR_DIFICULTAD', 'MANTENER_DIFICULTAD', 'REDUCIR_DIFICULTAD', 'REPETIR_ACTIVIDAD', 'ASIGNAR_REFUERZO', 'DESBLOQUEAR_SIGUIENTE_NIVEL', 'DESBLOQUEAR_SIGUIENTE_ACTIVIDAD');

-- CreateEnum
CREATE TYPE "EstadoRefuerzo" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terapeuta" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terapeuta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nino" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "terapeutaId" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" DATE NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuncionEjecutiva" (
    "id" TEXT NOT NULL,
    "nombre" "NombreFuncionEjecutiva" NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "FuncionEjecutiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL,
    "funcionEjecutivaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "ordenDesbloqueo" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NivelActividad" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "nivel" "NivelDificultad" NOT NULL,
    "configuracion" JSONB NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "puntajeMaximo" INTEGER NOT NULL,

    CONSTRAINT "NivelActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgresoActividad" (
    "id" TEXT NOT NULL,
    "ninoId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "nivelActual" "NivelDificultad" NOT NULL,
    "desbloqueada" BOOLEAN NOT NULL DEFAULT false,
    "bloqueadaManualmente" BOOLEAN NOT NULL DEFAULT false,
    "nivelSuperado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgresoActividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "ninoId" TEXT NOT NULL,
    "terapeutaId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "duracionMinutos" INTEGER,
    "puntajeGlobal" INTEGER,
    "precisionGlobal" DECIMAL(65,30),
    "estado" "EstadoSesion" NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intento" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT,
    "ninoId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "nivel" "NivelDificultad" NOT NULL,
    "respuestasCorrectas" INTEGER NOT NULL,
    "respuestasIncorrectas" INTEGER NOT NULL,
    "omisiones" INTEGER NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "precision" DECIMAL(65,30) NOT NULL,
    "tiempoSegundos" INTEGER NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "completado" BOOLEAN NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionProgresion" (
    "id" TEXT NOT NULL,
    "intentoId" TEXT,
    "ninoId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "funcionEjecutivaId" TEXT NOT NULL,
    "decision" "TipoDecision" NOT NULL,
    "nivelAnterior" "NivelDificultad",
    "nivelNuevo" "NivelDificultad",
    "precisionEvaluada" DECIMAL(65,30) NOT NULL,
    "razon" TEXT NOT NULL,
    "automatica" BOOLEAN NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionProgresion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refuerzo" (
    "id" TEXT NOT NULL,
    "ninoId" TEXT NOT NULL,
    "funcionEjecutivaId" TEXT NOT NULL,
    "actividadId" TEXT,
    "motivo" TEXT NOT NULL,
    "estado" "EstadoRefuerzo" NOT NULL,
    "asignadoPorTerapeutaId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refuerzo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recomendacion" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "funcionEjecutivaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recomendacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "terapeutaId" TEXT NOT NULL,
    "ninoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumenFuncionPorSesion" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "funcionEjecutivaId" TEXT NOT NULL,
    "precision" DECIMAL(65,30) NOT NULL,
    "intentosContados" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumenFuncionPorSesion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Terapeuta_usuarioId_key" ON "Terapeuta"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Nino_usuarioId_key" ON "Nino"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "FuncionEjecutiva_nombre_key" ON "FuncionEjecutiva"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "NivelActividad_actividadId_nivel_key" ON "NivelActividad"("actividadId", "nivel");

-- CreateIndex
CREATE UNIQUE INDEX "ProgresoActividad_ninoId_actividadId_key" ON "ProgresoActividad"("ninoId", "actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionProgresion_intentoId_key" ON "DecisionProgresion"("intentoId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumenFuncionPorSesion_sesionId_funcionEjecutivaId_key" ON "ResumenFuncionPorSesion"("sesionId", "funcionEjecutivaId");

-- AddForeignKey
ALTER TABLE "Terapeuta" ADD CONSTRAINT "Terapeuta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nino" ADD CONSTRAINT "Nino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nino" ADD CONSTRAINT "Nino_terapeutaId_fkey" FOREIGN KEY ("terapeutaId") REFERENCES "Terapeuta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actividad" ADD CONSTRAINT "Actividad_funcionEjecutivaId_fkey" FOREIGN KEY ("funcionEjecutivaId") REFERENCES "FuncionEjecutiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NivelActividad" ADD CONSTRAINT "NivelActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresoActividad" ADD CONSTRAINT "ProgresoActividad_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresoActividad" ADD CONSTRAINT "ProgresoActividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_terapeutaId_fkey" FOREIGN KEY ("terapeutaId") REFERENCES "Terapeuta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intento" ADD CONSTRAINT "Intento_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intento" ADD CONSTRAINT "Intento_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intento" ADD CONSTRAINT "Intento_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionProgresion" ADD CONSTRAINT "DecisionProgresion_intentoId_fkey" FOREIGN KEY ("intentoId") REFERENCES "Intento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionProgresion" ADD CONSTRAINT "DecisionProgresion_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionProgresion" ADD CONSTRAINT "DecisionProgresion_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionProgresion" ADD CONSTRAINT "DecisionProgresion_funcionEjecutivaId_fkey" FOREIGN KEY ("funcionEjecutivaId") REFERENCES "FuncionEjecutiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuerzo" ADD CONSTRAINT "Refuerzo_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuerzo" ADD CONSTRAINT "Refuerzo_funcionEjecutivaId_fkey" FOREIGN KEY ("funcionEjecutivaId") REFERENCES "FuncionEjecutiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuerzo" ADD CONSTRAINT "Refuerzo_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refuerzo" ADD CONSTRAINT "Refuerzo_asignadoPorTerapeutaId_fkey" FOREIGN KEY ("asignadoPorTerapeutaId") REFERENCES "Terapeuta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacion" ADD CONSTRAINT "Recomendacion_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacion" ADD CONSTRAINT "Recomendacion_funcionEjecutivaId_fkey" FOREIGN KEY ("funcionEjecutivaId") REFERENCES "FuncionEjecutiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_terapeutaId_fkey" FOREIGN KEY ("terapeutaId") REFERENCES "Terapeuta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_ninoId_fkey" FOREIGN KEY ("ninoId") REFERENCES "Nino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumenFuncionPorSesion" ADD CONSTRAINT "ResumenFuncionPorSesion_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumenFuncionPorSesion" ADD CONSTRAINT "ResumenFuncionPorSesion_funcionEjecutivaId_fkey" FOREIGN KEY ("funcionEjecutivaId") REFERENCES "FuncionEjecutiva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
