import type { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { noEncontrado } from '../../utiles/errores'
import { obtenerTerapeutaId } from '../../utiles/perfiles'

interface DatosNotificacion {
  terapeutaId: string
  ninoId: string
  tipo: string
  mensaje: string
}

/**
 * Crea una notificación para el terapeuta DENTRO de la transacción recibida.
 * Pensado para engancharse a eventos automáticos (motor adaptativo, cierres).
 */
export function crearNotificacion(
  tx: Prisma.TransactionClient,
  datos: DatosNotificacion,
) {
  return tx.notificacion.create({ data: { ...datos, leida: false } })
}

/** Notificaciones del terapeuta autenticado (las más recientes primero). */
export async function listarNotificaciones(
  usuarioIdTerapeuta: string,
  leida?: boolean,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  return prisma.notificacion.findMany({
    where: { terapeutaId, ...(leida === undefined ? {} : { leida }) },
    orderBy: { creadoEn: 'desc' },
    take: 100,
    include: { nino: { select: { id: true, nombres: true, apellidos: true } } },
  })
}

/** Marca una notificación del terapeuta como leída. */
export async function marcarLeida(usuarioIdTerapeuta: string, notificacionId: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const notif = await prisma.notificacion.findFirst({
    where: { id: notificacionId, terapeutaId },
    select: { id: true },
  })
  if (!notif) throw noEncontrado('Notificación no encontrada')

  return prisma.notificacion.update({
    where: { id: notificacionId },
    data: { leida: true },
  })
}
