import type { NivelDificultad, Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { conflicto, noEncontrado, solicitudInvalida } from '../../utiles/errores'
import {
  obtenerNinoId,
  obtenerTerapeutaId,
  asegurarNinoPropio,
} from '../../utiles/perfiles'
import { crearNotificacion } from '../notificaciones/notificaciones.servicio'
import { evaluarProgresion, ORDEN_NIVELES } from './progreso.reglas'

interface DatosProgresion {
  intentoId: string
  ninoId: string
  actividadId: string
  funcionEjecutivaId: string
  nivel: NivelDificultad
  precision: number
  completado: boolean
}

/**
 * Aplica el motor adaptativo sobre un intento ya registrado y persiste sus
 * efectos DENTRO de la transacción recibida (para ser atómico con el intento):
 *  - registra la DecisionProgresion automática,
 *  - actualiza (upsert) el ProgresoActividad del niño,
 *  - genera un Refuerzo PENDIENTE cuando el desempeño es muy bajo.
 *
 * La lógica de decisión vive en `progreso.reglas` (función pura); aquí solo se
 * traduce el resultado a escrituras en BD.
 */
export async function aplicarProgresion(
  tx: Prisma.TransactionClient,
  datos: DatosProgresion,
) {
  const resultado = evaluarProgresion({
    precision: datos.precision,
    completado: datos.completado,
    nivel: datos.nivel,
  })

  const decision = await tx.decisionProgresion.create({
    data: {
      intentoId: datos.intentoId,
      ninoId: datos.ninoId,
      actividadId: datos.actividadId,
      funcionEjecutivaId: datos.funcionEjecutivaId,
      decision: resultado.decision,
      nivelAnterior: resultado.nivelAnterior,
      nivelNuevo: resultado.nivelNuevo,
      precisionEvaluada: datos.precision,
      razon: resultado.razon,
      automatica: true,
    },
  })

  const progreso = await tx.progresoActividad.upsert({
    where: {
      ninoId_actividadId: { ninoId: datos.ninoId, actividadId: datos.actividadId },
    },
    create: {
      ninoId: datos.ninoId,
      actividadId: datos.actividadId,
      nivelActual: resultado.nivelNuevo,
      desbloqueada: true,
      nivelSuperado: resultado.nivelSuperado,
    },
    update: {
      nivelActual: resultado.nivelNuevo,
      // nivelSuperado es "pegajoso": una vez logrado no se revierte.
      ...(resultado.nivelSuperado ? { nivelSuperado: true } : {}),
    },
  })

  // Evita duplicados: si el niño ya tiene un refuerzo sin resolver para esta
  // actividad, no se crea otro (ni se vuelve a notificar al terapeuta).
  let refuerzo = null
  if (resultado.asignarRefuerzo) {
    const refuerzoAbierto = await tx.refuerzo.findFirst({
      where: {
        ninoId: datos.ninoId,
        actividadId: datos.actividadId,
        estado: { in: ['PENDIENTE', 'EN_PROGRESO'] },
      },
      select: { id: true },
    })
    if (!refuerzoAbierto) {
      refuerzo = await tx.refuerzo.create({
        data: {
          ninoId: datos.ninoId,
          funcionEjecutivaId: datos.funcionEjecutivaId,
          actividadId: datos.actividadId,
          motivo: resultado.razon,
          estado: 'PENDIENTE',
        },
      })
    }
  }

  // Avisa automáticamente al terapeuta de los eventos relevantes.
  let notificacion = null
  if (refuerzo || resultado.nivelSuperado) {
    const nino = await tx.nino.findUnique({
      where: { id: datos.ninoId },
      select: { terapeutaId: true, nombres: true, apellidos: true },
    })
    const actividad = await tx.actividad.findUnique({
      where: { id: datos.actividadId },
      select: { nombre: true },
    })
    if (nino && actividad) {
      const nombre = `${nino.nombres} ${nino.apellidos}`
      notificacion = await crearNotificacion(tx, {
        terapeutaId: nino.terapeutaId,
        ninoId: datos.ninoId,
        tipo: resultado.asignarRefuerzo ? 'REFUERZO_ASIGNADO' : 'ACTIVIDAD_SUPERADA',
        mensaje: resultado.asignarRefuerzo
          ? `${nombre} necesita refuerzo en "${actividad.nombre}" (precisión ${datos.precision}%).`
          : `${nombre} superó la actividad "${actividad.nombre}".`,
      })
    }
  }

  return { decision, progreso, refuerzo, notificacion }
}

// ── Lecturas para el terapeuta ─────────────────────────────────

/** Consulta base del progreso de un niño (compartida por ambos roles). */
function consultarProgreso(ninoId: string) {
  return prisma.progresoActividad.findMany({
    where: { ninoId },
    orderBy: { actividad: { ordenDesbloqueo: 'asc' } },
    include: {
      actividad: {
        select: {
          id: true,
          nombre: true,
          icono: true,
          ordenDesbloqueo: true,
          funcionEjecutiva: {
            select: { nombre: true, etiqueta: true, color: true },
          },
        },
      },
    },
  })
}

/**
 * Progreso del niño por actividad (nivel actual, si está desbloqueada y si ya
 * superó el nivel difícil). Ordenado por el desbloqueo de la actividad.
 */
export async function listarProgresoNino(
  usuarioIdTerapeuta: string,
  ninoId: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  await asegurarNinoPropio(terapeutaId, ninoId)

  return consultarProgreso(ninoId)
}

/** Progreso del propio niño autenticado (ignora cualquier filtro externo). */
export async function listarMiProgreso(usuarioIdNino: string) {
  const ninoId = await obtenerNinoId(usuarioIdNino)
  return consultarProgreso(ninoId)
}

// ── Controles manuales del terapeuta ───────────────────────────

/** Valida propiedad del niño y existencia de la actividad; devuelve ambos. */
async function prepararControlManual(
  usuarioIdTerapeuta: string,
  ninoId: string,
  actividadId: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  await asegurarNinoPropio(terapeutaId, ninoId)

  const actividad = await prisma.actividad.findFirst({
    where: { id: actividadId, activa: true },
    select: { id: true, funcionEjecutivaId: true, nombre: true },
  })
  if (!actividad) throw noEncontrado('Actividad no encontrada')
  return actividad
}

/**
 * Cambio manual de dificultad por el terapeuta. Registra una
 * DecisionProgresion manual (automatica: false, sin intento) y actualiza el
 * ProgresoActividad (upsert: la actividad puede no haberse jugado aún).
 * No toca nivelSuperado (sigue siendo "pegajoso" del motor).
 */
export async function cambiarNivelManual(
  usuarioIdTerapeuta: string,
  datos: { ninoId: string; actividadId: string; nivel: string; razon?: string },
) {
  if (!ORDEN_NIVELES.includes(datos.nivel as NivelDificultad)) {
    throw solicitudInvalida('Nivel de dificultad inválido')
  }
  const nivel = datos.nivel as NivelDificultad
  const actividad = await prepararControlManual(
    usuarioIdTerapeuta,
    datos.ninoId,
    datos.actividadId,
  )

  return prisma.$transaction(
    async (tx) => {
      const existente = await tx.progresoActividad.findUnique({
        where: {
          ninoId_actividadId: {
            ninoId: datos.ninoId,
            actividadId: datos.actividadId,
          },
        },
        select: { nivelActual: true },
      })
      const nivelAnterior = existente?.nivelActual ?? 'FACIL'
      if (existente && nivelAnterior === nivel) {
        throw conflicto(`El niño ya está en el nivel ${nivel} de esta actividad`)
      }

      const sube =
        ORDEN_NIVELES.indexOf(nivel) > ORDEN_NIVELES.indexOf(nivelAnterior)
      const decision = await tx.decisionProgresion.create({
        data: {
          intentoId: null,
          ninoId: datos.ninoId,
          actividadId: datos.actividadId,
          funcionEjecutivaId: actividad.funcionEjecutivaId,
          decision: sube ? 'AUMENTAR_DIFICULTAD' : 'REDUCIR_DIFICULTAD',
          nivelAnterior,
          nivelNuevo: nivel,
          precisionEvaluada: 0,
          razon:
            datos.razon?.trim() ||
            `Ajuste manual del terapeuta: nivel ${nivelAnterior} → ${nivel}.`,
          automatica: false,
        },
      })

      const progreso = await tx.progresoActividad.upsert({
        where: {
          ninoId_actividadId: {
            ninoId: datos.ninoId,
            actividadId: datos.actividadId,
          },
        },
        create: {
          ninoId: datos.ninoId,
          actividadId: datos.actividadId,
          nivelActual: nivel,
          desbloqueada: true,
        },
        update: { nivelActual: nivel },
      })

      return { progreso, decision }
    },
    { maxWait: 10000, timeout: 15000 },
  )
}

/**
 * Bloqueo/desbloqueo manual de una actividad para un niño. Registra la
 * DecisionProgresion manual correspondiente y actualiza (upsert) el progreso.
 * Bloquear una actividad nunca jugada NO la desbloquea para el niño.
 */
export async function cambiarBloqueoManual(
  usuarioIdTerapeuta: string,
  datos: {
    ninoId: string
    actividadId: string
    bloqueada: boolean
    razon?: string
  },
) {
  if (typeof datos.bloqueada !== 'boolean') {
    throw solicitudInvalida('El campo "bloqueada" debe ser booleano')
  }
  const actividad = await prepararControlManual(
    usuarioIdTerapeuta,
    datos.ninoId,
    datos.actividadId,
  )

  return prisma.$transaction(
    async (tx) => {
      const existente = await tx.progresoActividad.findUnique({
        where: {
          ninoId_actividadId: {
            ninoId: datos.ninoId,
            actividadId: datos.actividadId,
          },
        },
        select: { bloqueadaManualmente: true },
      })
      const estadoActual = existente?.bloqueadaManualmente ?? false
      if (estadoActual === datos.bloqueada) {
        throw conflicto(
          datos.bloqueada
            ? 'La actividad ya está bloqueada para este niño'
            : 'La actividad no está bloqueada para este niño',
        )
      }

      const decision = await tx.decisionProgresion.create({
        data: {
          intentoId: null,
          ninoId: datos.ninoId,
          actividadId: datos.actividadId,
          funcionEjecutivaId: actividad.funcionEjecutivaId,
          decision: datos.bloqueada ? 'BLOQUEAR_ACTIVIDAD' : 'DESBLOQUEAR_ACTIVIDAD',
          nivelAnterior: null,
          nivelNuevo: null,
          precisionEvaluada: 0,
          razon:
            datos.razon?.trim() ||
            `${datos.bloqueada ? 'Bloqueo' : 'Desbloqueo'} manual de "${actividad.nombre}" por el terapeuta.`,
          automatica: false,
        },
      })

      const progreso = await tx.progresoActividad.upsert({
        where: {
          ninoId_actividadId: {
            ninoId: datos.ninoId,
            actividadId: datos.actividadId,
          },
        },
        create: {
          ninoId: datos.ninoId,
          actividadId: datos.actividadId,
          nivelActual: 'FACIL',
          desbloqueada: false,
          bloqueadaManualmente: datos.bloqueada,
        },
        update: { bloqueadaManualmente: datos.bloqueada },
      })

      return { progreso, decision }
    },
    { maxWait: 10000, timeout: 15000 },
  )
}

/**
 * Historial de decisiones de progresión del niño (las más recientes primero).
 * Filtro opcional por actividad.
 */
export async function listarDecisionesNino(
  usuarioIdTerapeuta: string,
  ninoId: string,
  actividadId?: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  await asegurarNinoPropio(terapeutaId, ninoId)

  return prisma.decisionProgresion.findMany({
    where: { ninoId, ...(actividadId ? { actividadId } : {}) },
    orderBy: { creadoEn: 'desc' },
    take: 100,
    include: {
      actividad: { select: { id: true, nombre: true } },
      funcionEjecutiva: { select: { nombre: true, etiqueta: true } },
      intento: { select: { id: true, precision: true, creadoEn: true } },
    },
  })
}
