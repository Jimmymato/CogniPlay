import { prisma } from '../../config/prisma'
import { solicitudInvalida } from '../../utiles/errores'
import { fechaDeFiltro, filtroCreadoEn } from '../../utiles/fechas'
import { asegurarNinoPropio, obtenerTerapeutaId } from '../../utiles/perfiles'
import { clasificarPrecision, generarResumenApoyo } from './reportes.reglas'

/**
 * Módulo de reportes (Subfase 4.10): datos agregados de evolución por niño
 * para la vista de reportes del terapeuta. El campo `exportacion.formatos`
 * anuncia los formatos de descarga disponibles (ver reportes.exportador).
 */

interface FiltrosReporte {
  ninoId: string
  desde?: string
  hasta?: string
}

const redondear2 = (valor: number) => Math.round(valor * 100) / 100

/** Valida el periodo y resuelve las cotas de fecha del reporte. */
function resolverPeriodo(filtros: FiltrosReporte) {
  const desde = fechaDeFiltro(filtros.desde, 'desde')
  const hasta = fechaDeFiltro(filtros.hasta, 'hasta')
  if (desde && hasta && desde > hasta) {
    throw solicitudInvalida('El parámetro "desde" no puede ser posterior a "hasta"')
  }
  return { desde, hasta }
}

/** Autoriza el acceso: el niño debe pertenecer al terapeuta autenticado. */
async function autorizarReporte(usuarioId: string, ninoId: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioId)
  await asegurarNinoPropio(terapeutaId, ninoId)
}

export async function obtenerResumenReporte(usuarioId: string, filtros: FiltrosReporte) {
  await autorizarReporte(usuarioId, filtros.ninoId)
  const { desde, hasta } = resolverPeriodo(filtros)
  const rango = filtroCreadoEn(desde, hasta)

  const [nino, funciones, intentos, progresos, refuerzos] = await Promise.all([
    prisma.nino.findUnique({
      where: { id: filtros.ninoId },
      select: { id: true, nombres: true, apellidos: true, fechaNacimiento: true },
    }),
    prisma.funcionEjecutiva.findMany({
      orderBy: { orden: 'asc' },
      select: { id: true, nombre: true, etiqueta: true, color: true, orden: true },
    }),
    prisma.intento.findMany({
      where: { ninoId: filtros.ninoId, ...rango },
      select: {
        precision: true,
        puntaje: true,
        tiempoSegundos: true,
        completado: true,
        actividadId: true,
        actividad: { select: { funcionEjecutivaId: true } },
      },
    }),
    prisma.progresoActividad.findMany({
      where: { ninoId: filtros.ninoId },
      select: { nivelSuperado: true },
    }),
    prisma.refuerzo.findMany({
      where: { ninoId: filtros.ninoId, ...rango },
      select: { estado: true },
    }),
  ])

  // ── Totales del periodo ───────────────────────────────────
  const totalIntentos = intentos.length
  const precisiones = intentos.map((i) => Number(i.precision))
  const precisionPromedio =
    totalIntentos > 0
      ? redondear2(precisiones.reduce((s, p) => s + p, 0) / totalIntentos)
      : 0
  const puntajePromedio =
    totalIntentos > 0
      ? redondear2(intentos.reduce((s, i) => s + i.puntaje, 0) / totalIntentos)
      : 0
  const tiempoTotalSegundos = intentos.reduce((s, i) => s + i.tiempoSegundos, 0)
  const actividadesJugadas = new Set(intentos.map((i) => i.actividadId)).size

  // ── Desglose por función ejecutiva (incluye funciones sin datos) ──
  const porFuncion = funciones.map((funcion) => {
    const propios = intentos.filter(
      (i) => i.actividad.funcionEjecutivaId === funcion.id,
    )
    const promedio =
      propios.length > 0
        ? redondear2(
            propios.reduce((s, i) => s + Number(i.precision), 0) / propios.length,
          )
        : 0
    return {
      funcionEjecutivaId: funcion.id,
      nombre: funcion.nombre,
      etiqueta: funcion.etiqueta,
      color: funcion.color,
      orden: funcion.orden,
      intentos: propios.length,
      precisionPromedio: promedio,
      puntajePromedio:
        propios.length > 0
          ? redondear2(propios.reduce((s, i) => s + i.puntaje, 0) / propios.length)
          : 0,
      categoria: propios.length > 0 ? clasificarPrecision(promedio) : null,
    }
  })

  const conDatos = porFuncion.filter((f) => f.intentos > 0)
  const areasFuertes = conDatos.filter((f) => f.categoria === 'FUERTE')
  const areasRefuerzo = conDatos.filter(
    (f) => f.categoria === 'IRREGULAR' || f.categoria === 'NECESITA_REFUERZO',
  )

  return {
    nino,
    periodo: {
      desde: desde?.toISOString() ?? null,
      hasta: hasta?.toISOString() ?? null,
    },
    totales: {
      intentos: totalIntentos,
      actividadesJugadas,
      intentosCompletados: intentos.filter((i) => i.completado).length,
      precisionPromedio,
      puntajePromedio,
      tiempoTotalSegundos,
      // Estado actual (no depende del periodo): actividades ya dominadas.
      actividadesSuperadas: progresos.filter((p) => p.nivelSuperado).length,
      refuerzosAsignados: refuerzos.length,
      refuerzosPendientes: refuerzos.filter((r) => r.estado === 'PENDIENTE').length,
      refuerzosCompletados: refuerzos.filter((r) => r.estado === 'COMPLETADO').length,
    },
    porFuncion,
    areasFuertes: areasFuertes.map((f) => ({
      funcionEjecutivaId: f.funcionEjecutivaId,
      etiqueta: f.etiqueta,
      color: f.color,
      precisionPromedio: f.precisionPromedio,
    })),
    areasRefuerzo: areasRefuerzo.map((f) => ({
      funcionEjecutivaId: f.funcionEjecutivaId,
      etiqueta: f.etiqueta,
      color: f.color,
      precisionPromedio: f.precisionPromedio,
    })),
    resumenApoyo: generarResumenApoyo(
      porFuncion.map((f) => ({
        etiqueta: f.etiqueta,
        precisionPromedio: f.precisionPromedio,
        intentos: f.intentos,
      })),
    ),
    exportacion: { formatos: ['PDF', 'XLSX'] },
  }
}

export async function obtenerHistorialReporte(
  usuarioId: string,
  filtros: FiltrosReporte,
) {
  await autorizarReporte(usuarioId, filtros.ninoId)
  const { desde, hasta } = resolverPeriodo(filtros)

  // Orden ascendente: el historial alimenta gráficos de evolución temporal.
  return prisma.intento.findMany({
    where: { ninoId: filtros.ninoId, ...filtroCreadoEn(desde, hasta) },
    orderBy: { creadoEn: 'asc' },
    select: {
      id: true,
      creadoEn: true,
      nivel: true,
      precision: true,
      puntaje: true,
      completado: true,
      tiempoSegundos: true,
      actividad: {
        select: {
          id: true,
          nombre: true,
          icono: true,
          funcionEjecutivaId: true,
          funcionEjecutiva: { select: { etiqueta: true, color: true } },
        },
      },
      decision: { select: { decision: true } },
    },
  })
}
