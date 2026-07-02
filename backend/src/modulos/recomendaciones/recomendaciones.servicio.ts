import type { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { noEncontrado } from '../../utiles/errores'
import { obtenerTerapeutaId } from '../../utiles/perfiles'
import { generarTextoRecomendacion } from './recomendaciones.reglas'

interface EntradaRecomendacion {
  funcionEjecutivaId: string
  precision: number
}

/**
 * Genera las recomendaciones de una sesión (una por función ejecutiva evaluada)
 * DENTRO de la transacción de cierre. Los textos se construyen por reglas a
 * partir de la precisión promedio de cada función.
 */
export async function generarRecomendaciones(
  tx: Prisma.TransactionClient,
  sesionId: string,
  entradas: EntradaRecomendacion[],
) {
  if (entradas.length === 0) return []

  const funciones = await tx.funcionEjecutiva.findMany({
    where: { id: { in: entradas.map((e) => e.funcionEjecutivaId) } },
    select: { id: true, etiqueta: true },
  })
  const etiquetaPorId = new Map(funciones.map((f) => [f.id, f.etiqueta]))

  const creadas = []
  for (const { funcionEjecutivaId, precision } of entradas) {
    const etiqueta = etiquetaPorId.get(funcionEjecutivaId) ?? 'Función ejecutiva'
    creadas.push(
      await tx.recomendacion.create({
        data: {
          sesionId,
          funcionEjecutivaId,
          texto: generarTextoRecomendacion(etiqueta, precision),
        },
      }),
    )
  }
  return creadas
}

/** Recomendaciones de una sesión del terapeuta autenticado. */
export async function listarRecomendaciones(
  usuarioIdTerapeuta: string,
  sesionId: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const sesion = await prisma.sesion.findFirst({
    where: { id: sesionId, terapeutaId },
    select: { id: true },
  })
  if (!sesion) throw noEncontrado('Sesión no encontrada')

  return prisma.recomendacion.findMany({
    where: { sesionId },
    orderBy: { funcionEjecutiva: { orden: 'asc' } },
    include: { funcionEjecutiva: { select: { nombre: true, etiqueta: true, color: true } } },
  })
}
