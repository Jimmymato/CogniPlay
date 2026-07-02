import { prisma } from '../config/prisma'
import { noEncontrado } from './errores'

/** Resuelve el id del Terapeuta a partir del usuario autenticado. */
export async function obtenerTerapeutaId(usuarioId: string) {
  const terapeuta = await prisma.terapeuta.findUnique({
    where: { usuarioId },
    select: { id: true },
  })
  if (!terapeuta) throw noEncontrado('Terapeuta no encontrado')
  return terapeuta.id
}

/** Resuelve el id del Niño a partir del usuario autenticado. */
export async function obtenerNinoId(usuarioId: string) {
  const nino = await prisma.nino.findUnique({
    where: { usuarioId },
    select: { id: true },
  })
  if (!nino) throw noEncontrado('Niño no encontrado')
  return nino.id
}

/**
 * Verifica que el niño exista y pertenezca al terapeuta indicado.
 * Devuelve `{ id, activo }`. Si no es suyo (o no existe) → 404, sin filtrar
 * la existencia del recurso.
 */
export async function asegurarNinoPropio(terapeutaId: string, ninoId: string) {
  const nino = await prisma.nino.findFirst({
    where: { id: ninoId, terapeutaId },
    select: { id: true, activo: true },
  })
  if (!nino) throw noEncontrado('Niño no encontrado')
  return nino
}
