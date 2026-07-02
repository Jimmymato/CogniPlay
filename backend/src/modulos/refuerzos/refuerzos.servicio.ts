import type { EstadoRefuerzo } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { noEncontrado, solicitudInvalida } from '../../utiles/errores'
import { asegurarNinoPropio, obtenerTerapeutaId } from '../../utiles/perfiles'

const ESTADOS_VALIDOS: EstadoRefuerzo[] = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO']

const incluirDetalle = {
  nino: { select: { id: true, nombres: true, apellidos: true } },
  funcionEjecutiva: { select: { nombre: true, etiqueta: true, color: true } },
  actividad: { select: { id: true, nombre: true } },
}

/**
 * Lista los refuerzos de los niños del terapeuta autenticado.
 * Filtros opcionales por niño (debe ser suyo) y por estado.
 */
export async function listarRefuerzos(
  usuarioIdTerapeuta: string,
  ninoId?: string,
  estado?: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  if (ninoId) await asegurarNinoPropio(terapeutaId, ninoId)
  if (estado && !ESTADOS_VALIDOS.includes(estado as EstadoRefuerzo)) {
    throw solicitudInvalida('Estado de refuerzo inválido')
  }

  return prisma.refuerzo.findMany({
    where: {
      nino: { terapeutaId },
      ...(ninoId ? { ninoId } : {}),
      ...(estado ? { estado: estado as EstadoRefuerzo } : {}),
    },
    orderBy: { creadoEn: 'desc' },
    include: incluirDetalle,
  })
}

/**
 * Asignación manual de un refuerzo por parte del terapeuta.
 */
export async function asignarRefuerzo(
  usuarioIdTerapeuta: string,
  datos: {
    ninoId: string
    funcionEjecutivaId: string
    actividadId?: string
    motivo: string
  },
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  await asegurarNinoPropio(terapeutaId, datos.ninoId)

  const funcion = await prisma.funcionEjecutiva.findUnique({
    where: { id: datos.funcionEjecutivaId },
    select: { id: true },
  })
  if (!funcion) throw noEncontrado('Función ejecutiva no encontrada')

  if (datos.actividadId) {
    const actividad = await prisma.actividad.findUnique({
      where: { id: datos.actividadId },
      select: { id: true },
    })
    if (!actividad) throw noEncontrado('Actividad no encontrada')
  }

  return prisma.refuerzo.create({
    data: {
      ninoId: datos.ninoId,
      funcionEjecutivaId: datos.funcionEjecutivaId,
      actividadId: datos.actividadId ?? null,
      motivo: datos.motivo,
      estado: 'PENDIENTE',
      asignadoPorTerapeutaId: terapeutaId,
    },
    include: incluirDetalle,
  })
}

/**
 * Cambia el estado de un refuerzo de un niño del terapeuta.
 * Al gestionarlo, el terapeuta queda registrado como responsable.
 */
export async function cambiarEstadoRefuerzo(
  usuarioIdTerapeuta: string,
  refuerzoId: string,
  estado: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  if (!estado || !ESTADOS_VALIDOS.includes(estado as EstadoRefuerzo)) {
    throw solicitudInvalida('Estado de refuerzo inválido')
  }

  const refuerzo = await prisma.refuerzo.findFirst({
    where: { id: refuerzoId, nino: { terapeutaId } },
    select: { id: true, asignadoPorTerapeutaId: true },
  })
  if (!refuerzo) throw noEncontrado('Refuerzo no encontrado')

  return prisma.refuerzo.update({
    where: { id: refuerzoId },
    data: {
      estado: estado as EstadoRefuerzo,
      // Si nadie lo gestionaba (refuerzo automático), el terapeuta lo asume.
      ...(refuerzo.asignadoPorTerapeutaId
        ? {}
        : { asignadoPorTerapeutaId: terapeutaId }),
    },
    include: incluirDetalle,
  })
}
