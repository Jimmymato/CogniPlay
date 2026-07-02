import { prisma } from '../../config/prisma'
import { conflicto, noEncontrado, solicitudInvalida } from '../../utiles/errores'
import { obtenerTerapeutaId } from '../../utiles/perfiles'
import { generarRecomendaciones } from '../recomendaciones/recomendaciones.servicio'

const dosDecimales = (n: number) => Math.round(n * 100) / 100

/** Verifica que el niño exista y pertenezca al terapeuta autenticado. */
async function asegurarNinoPropio(terapeutaId: string, ninoId: string) {
  const nino = await prisma.nino.findFirst({
    where: { id: ninoId, terapeutaId },
    select: { id: true, activo: true },
  })
  if (!nino) throw noEncontrado('Niño no encontrado')
  return nino
}

export async function abrirSesion(usuarioIdTerapeuta: string, ninoId: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const nino = await asegurarNinoPropio(terapeutaId, ninoId)
  if (!nino.activo) throw solicitudInvalida('El niño está desactivado')

  const enCurso = await prisma.sesion.findFirst({
    where: { ninoId, estado: 'EN_CURSO' },
    select: { id: true },
  })
  if (enCurso) throw conflicto('El niño ya tiene una sesión en curso')

  return prisma.sesion.create({
    data: {
      ninoId,
      terapeutaId,
      fechaInicio: new Date(),
      estado: 'EN_CURSO',
    },
  })
}

export async function listarSesiones(usuarioIdTerapeuta: string, ninoId?: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  return prisma.sesion.findMany({
    where: { terapeutaId, ...(ninoId ? { ninoId } : {}) },
    orderBy: { fechaInicio: 'desc' },
    include: { nino: { select: { id: true, nombres: true, apellidos: true } } },
  })
}

export async function obtenerSesion(usuarioIdTerapeuta: string, sesionId: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const sesion = await prisma.sesion.findFirst({
    where: { id: sesionId, terapeutaId },
    include: {
      nino: { select: { id: true, nombres: true, apellidos: true } },
      intentos: {
        orderBy: { creadoEn: 'asc' },
        include: { actividad: { select: { id: true, nombre: true } } },
      },
      resumenes: {
        include: { funcionEjecutiva: { select: { nombre: true, etiqueta: true } } },
      },
    },
  })
  if (!sesion) throw noEncontrado('Sesión no encontrada')
  return sesion
}

export async function cerrarSesion(usuarioIdTerapeuta: string, sesionId: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const sesion = await prisma.sesion.findFirst({
    where: { id: sesionId, terapeutaId },
    include: {
      intentos: {
        include: { actividad: { select: { funcionEjecutivaId: true } } },
      },
    },
  })
  if (!sesion) throw noEncontrado('Sesión no encontrada')
  if (sesion.estado !== 'EN_CURSO') throw conflicto('La sesión ya está cerrada')

  const fechaFin = new Date()
  const duracionMinutos = Math.max(
    1,
    Math.round((fechaFin.getTime() - sesion.fechaInicio.getTime()) / 60000),
  )

  const intentos = sesion.intentos
  const puntajeGlobal = intentos.reduce((suma, i) => suma + i.puntaje, 0)
  const precisionGlobal = intentos.length
    ? dosDecimales(
        intentos.reduce((suma, i) => suma + Number(i.precision), 0) / intentos.length,
      )
    : 0

  // Promedio de precisión por función ejecutiva (para el radar y los reportes).
  const porFuncion = new Map<string, { suma: number; cuenta: number }>()
  for (const i of intentos) {
    const fid = i.actividad.funcionEjecutivaId
    const acc = porFuncion.get(fid) ?? { suma: 0, cuenta: 0 }
    acc.suma += Number(i.precision)
    acc.cuenta += 1
    porFuncion.set(fid, acc)
  }

  const estado = intentos.length > 0 ? 'COMPLETADA' : 'ABANDONADA'

  return prisma.$transaction(
    async (tx) => {
      const entradasRecomendacion: { funcionEjecutivaId: string; precision: number }[] = []
      for (const [funcionEjecutivaId, acc] of porFuncion) {
        const precision = dosDecimales(acc.suma / acc.cuenta)
        await tx.resumenFuncionPorSesion.upsert({
          where: {
            sesionId_funcionEjecutivaId: { sesionId, funcionEjecutivaId },
          },
          create: {
            sesionId,
            funcionEjecutivaId,
            precision,
            intentosContados: acc.cuenta,
          },
          update: { precision, intentosContados: acc.cuenta },
        })
        entradasRecomendacion.push({ funcionEjecutivaId, precision })
      }

      // Recomendaciones por reglas (una por función ejecutiva evaluada).
      await generarRecomendaciones(tx, sesionId, entradasRecomendacion)

      return tx.sesion.update({
        where: { id: sesionId },
        data: { fechaFin, duracionMinutos, puntajeGlobal, precisionGlobal, estado },
        include: {
          resumenes: {
            include: { funcionEjecutiva: { select: { nombre: true, etiqueta: true } } },
          },
          recomendaciones: {
            include: { funcionEjecutiva: { select: { nombre: true, etiqueta: true } } },
          },
        },
      })
    },
    { maxWait: 10000, timeout: 15000 },
  )
}
