import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import {
  generarExcelReporte,
  generarPdfReporte,
  nombreArchivoReporte,
} from './reportes.exportador'
import { obtenerHistorialReporte, obtenerResumenReporte } from './reportes.servicio'

function filtrosDeConsulta(req: Request) {
  const ninoId = req.query.ninoId as string | undefined
  if (!ninoId) throw solicitudInvalida('El parámetro "ninoId" es obligatorio')
  return {
    ninoId,
    desde: req.query.desde as string | undefined,
    hasta: req.query.hasta as string | undefined,
  }
}

export async function getResumen(req: Request, res: Response) {
  const resumen = await obtenerResumenReporte(
    req.usuario!.usuarioId,
    filtrosDeConsulta(req),
  )
  res.json(resumen)
}

export async function getHistorial(req: Request, res: Response) {
  const historial = await obtenerHistorialReporte(
    req.usuario!.usuarioId,
    filtrosDeConsulta(req),
  )
  res.json(historial)
}

// Descarga del reporte como archivo. `formato` acepta pdf o xlsx.
export async function getExportar(req: Request, res: Response) {
  const formato = String(req.query.formato ?? '').toLowerCase()
  if (formato !== 'pdf' && formato !== 'xlsx') {
    throw solicitudInvalida('El parámetro "formato" debe ser "pdf" o "xlsx"')
  }

  const filtros = filtrosDeConsulta(req)
  // Reutiliza los mismos servicios que la pantalla: misma autorización
  // (terapeuta dueño del niño) y mismos números que se ven en el reporte.
  const [resumen, historial] = await Promise.all([
    obtenerResumenReporte(req.usuario!.usuarioId, filtros),
    obtenerHistorialReporte(req.usuario!.usuarioId, filtros),
  ])

  const esPdf = formato === 'pdf'
  const archivo = esPdf
    ? await generarPdfReporte(resumen, historial)
    : await generarExcelReporte(resumen, historial)

  res.setHeader(
    'Content-Type',
    esPdf
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${nombreArchivoReporte(resumen, formato)}"`,
  )
  res.send(archivo)
}
