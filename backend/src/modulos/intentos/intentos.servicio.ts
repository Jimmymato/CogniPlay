import type { NivelDificultad } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { conflicto, noEncontrado, solicitudInvalida } from '../../utiles/errores'
import { fechaDeFiltro, filtroCreadoEn } from '../../utiles/fechas'
import { obtenerNinoId, obtenerTerapeutaId } from '../../utiles/perfiles'
import type { CargaToken } from '../../utiles/jwt'
import { aplicarProgresion } from '../progreso/progreso.servicio'

const NIVELES_VALIDOS: NivelDificultad[] = ['FACIL', 'MEDIO', 'DIFICIL']

interface DatosIntento {
  actividadId: string
  nivel: string
  respuestasCorrectas: number
  respuestasIncorrectas: number
  omisiones: number
  tiempoSegundos: number
  sesionId?: string | null
}

const esEnteroNoNegativo = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0

export async function registrarIntento(usuarioIdNino: string, datos: DatosIntento) {
  const ninoId = await obtenerNinoId(usuarioIdNino)

  if (!NIVELES_VALIDOS.includes(datos.nivel as NivelDificultad)) {
    throw solicitudInvalida('El nivel debe ser FACIL, MEDIO o DIFICIL')
  }
  const nivel = datos.nivel as NivelDificultad

  for (const campo of [
    'respuestasCorrectas',
    'respuestasIncorrectas',
    'omisiones',
    'tiempoSegundos',
  ] as const) {
    if (!esEnteroNoNegativo(datos[campo])) {
      throw solicitudInvalida(`El campo "${campo}" debe ser un entero mayor o igual a 0`)
    }
  }

  const nivelActividad = await prisma.nivelActividad.findUnique({
    where: { actividadId_nivel: { actividadId: datos.actividadId, nivel } },
    include: { actividad: { select: { activa: true, funcionEjecutivaId: true } } },
  })
  if (!nivelActividad || !nivelActividad.actividad.activa) {
    throw noEncontrado('Actividad o nivel no encontrado')
  }

  const totalItems =
    datos.respuestasCorrectas + datos.respuestasIncorrectas + datos.omisiones
  if (totalItems !== nivelActividad.totalItems) {
    throw solicitudInvalida(
      `La suma de correctas, incorrectas y omisiones (${totalItems}) debe igualar el total de ítems del nivel (${nivelActividad.totalItems})`,
    )
  }

  // Una actividad bloqueada por el terapeuta no acepta intentos.
  const progresoActual = await prisma.progresoActividad.findUnique({
    where: { ninoId_actividadId: { ninoId, actividadId: datos.actividadId } },
    select: { bloqueadaManualmente: true },
  })
  if (progresoActual?.bloqueadaManualmente) {
    throw conflicto('La actividad está bloqueada por tu terapeuta')
  }

  const precision = Math.round((datos.respuestasCorrectas / totalItems) * 10000) / 100
  const puntaje = Math.round(
    (nivelActividad.puntajeMaximo * datos.respuestasCorrectas) / totalItems,
  )
  const completado = datos.omisiones === 0

  // Si el intento pertenece a una sesión, debe ser del propio niño y estar en curso.
  let sesionId: string | null = null
  if (datos.sesionId) {
    const sesion = await prisma.sesion.findFirst({
      where: { id: datos.sesionId, ninoId },
      select: { id: true, estado: true },
    })
    if (!sesion) throw noEncontrado('Sesión no encontrada')
    if (sesion.estado !== 'EN_CURSO') {
      throw solicitudInvalida('La sesión no está en curso')
    }
    sesionId = sesion.id
  }

  // El intento y la decisión del motor adaptativo se guardan de forma atómica.
  return prisma.$transaction(
    async (tx) => {
      const intento = await tx.intento.create({
        data: {
          sesionId,
          ninoId,
          actividadId: datos.actividadId,
          nivel,
          respuestasCorrectas: datos.respuestasCorrectas,
          respuestasIncorrectas: datos.respuestasIncorrectas,
          omisiones: datos.omisiones,
          totalItems,
          precision,
          tiempoSegundos: datos.tiempoSegundos,
          puntaje,
          completado,
        },
        include: { actividad: { select: { id: true, nombre: true } } },
      })

      const progresion = await aplicarProgresion(tx, {
        intentoId: intento.id,
        ninoId,
        actividadId: datos.actividadId,
        funcionEjecutivaId: nivelActividad.actividad.funcionEjecutivaId,
        nivel,
        precision,
        completado,
      })

      return { ...intento, progresion }
    },
    { maxWait: 10000, timeout: 15000 },
  )
}

interface FiltrosIntentos {
  ninoId?: string
  sesionId?: string
  actividadId?: string
  desde?: string
  hasta?: string
}

export async function listarIntentos(usuario: CargaToken, filtros: FiltrosIntentos) {
  let ninoId: string

  if (usuario.rol === 'NINO') {
    // El niño solo ve sus propios intentos.
    ninoId = await obtenerNinoId(usuario.usuarioId)
  } else {
    // El terapeuta debe indicar un niño suyo.
    if (!filtros.ninoId) throw solicitudInvalida('Falta el parámetro "ninoId"')
    const terapeutaId = await obtenerTerapeutaId(usuario.usuarioId)
    const nino = await prisma.nino.findFirst({
      where: { id: filtros.ninoId, terapeutaId },
      select: { id: true },
    })
    if (!nino) throw noEncontrado('Niño no encontrado')
    ninoId = nino.id
  }

  const desde = fechaDeFiltro(filtros.desde, 'desde')
  const hasta = fechaDeFiltro(filtros.hasta, 'hasta')

  return prisma.intento.findMany({
    where: {
      ninoId,
      ...(filtros.sesionId ? { sesionId: filtros.sesionId } : {}),
      ...(filtros.actividadId ? { actividadId: filtros.actividadId } : {}),
      ...filtroCreadoEn(desde, hasta),
    },
    orderBy: { creadoEn: 'desc' },
    include: {
      actividad: {
        select: {
          id: true,
          nombre: true,
          icono: true,
          funcionEjecutivaId: true,
          funcionEjecutiva: { select: { etiqueta: true, color: true } },
        },
      },
    },
  })
}
