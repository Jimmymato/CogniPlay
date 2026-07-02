import { prisma } from '../../config/prisma'
import { noEncontrado } from '../../utiles/errores'

/** Las 7 funciones ejecutivas con sus actividades activas y los niveles de cada una. */
export async function listarFunciones() {
  return prisma.funcionEjecutiva.findMany({
    orderBy: { orden: 'asc' },
    include: {
      actividades: {
        where: { activa: true },
        orderBy: { ordenDesbloqueo: 'asc' },
        include: {
          niveles: { orderBy: { nivel: 'asc' } },
        },
      },
    },
  })
}

export async function obtenerActividad(id: string) {
  const actividad = await prisma.actividad.findUnique({
    where: { id },
    include: {
      funcionEjecutiva: true,
      niveles: { orderBy: { nivel: 'asc' } },
    },
  })
  if (!actividad) throw noEncontrado('Actividad no encontrada')
  return actividad
}
