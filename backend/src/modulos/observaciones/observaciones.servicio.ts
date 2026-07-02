import { prisma } from '../../config/prisma'
import { solicitudInvalida } from '../../utiles/errores'
import { asegurarNinoPropio, obtenerTerapeutaId } from '../../utiles/perfiles'

const LARGO_MAXIMO_TEXTO = 2000

const incluirAutor = {
  terapeuta: { select: { nombres: true, apellidos: true } },
}

/**
 * Lista las observaciones clínicas registradas sobre un niño del terapeuta
 * (las más recientes primero). Se listan todas las del niño, sin importar
 * qué terapeuta las escribió: el guardián de propiedad ya restringe el acceso.
 */
export async function listarObservaciones(
  usuarioIdTerapeuta: string,
  ninoId: string,
) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  await asegurarNinoPropio(terapeutaId, ninoId)

  return prisma.observacionTerapeuta.findMany({
    where: { ninoId },
    orderBy: { creadoEn: 'desc' },
    include: incluirAutor,
  })
}

/**
 * Registra una observación del terapeuta autenticado sobre uno de sus niños.
 */
export async function crearObservacion(
  usuarioIdTerapeuta: string,
  datos: { ninoId: string; texto: string },
) {
  const texto = datos.texto?.trim()
  if (!texto) {
    throw solicitudInvalida('El texto de la observación no puede estar vacío')
  }
  if (texto.length > LARGO_MAXIMO_TEXTO) {
    throw solicitudInvalida(
      `El texto de la observación no puede superar ${LARGO_MAXIMO_TEXTO} caracteres`,
    )
  }

  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  await asegurarNinoPropio(terapeutaId, datos.ninoId)

  return prisma.observacionTerapeuta.create({
    data: { ninoId: datos.ninoId, terapeutaId, texto },
    include: incluirAutor,
  })
}
