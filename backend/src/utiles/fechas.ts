import { solicitudInvalida } from './errores'

/** Convierte un filtro de fecha ISO en Date, validando el formato. */
export function fechaDeFiltro(valor: string | undefined, campo: string): Date | undefined {
  if (!valor) return undefined
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) {
    throw solicitudInvalida(`Fecha inválida en el parámetro "${campo}"`)
  }
  return fecha
}

/**
 * Construye el filtro Prisma `{ creadoEn: { gte, lte } }` para un rango de
 * fechas opcional. Devuelve `{}` si no hay ninguna cota.
 */
export function filtroCreadoEn(desde?: Date, hasta?: Date) {
  if (!desde && !hasta) return {}
  return {
    creadoEn: {
      ...(desde ? { gte: desde } : {}),
      ...(hasta ? { lte: hasta } : {}),
    },
  }
}
