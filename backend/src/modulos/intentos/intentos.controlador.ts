import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import { listarIntentos, registrarIntento } from './intentos.servicio'

export async function postIntento(req: Request, res: Response) {
  const {
    actividadId,
    nivel,
    respuestasCorrectas,
    respuestasIncorrectas,
    omisiones,
    tiempoSegundos,
    sesionId,
  } = req.body ?? {}

  if (!actividadId || !nivel) {
    throw solicitudInvalida('Los campos "actividadId" y "nivel" son obligatorios')
  }

  const intento = await registrarIntento(req.usuario!.usuarioId, {
    actividadId,
    nivel,
    respuestasCorrectas,
    respuestasIncorrectas,
    omisiones,
    tiempoSegundos,
    sesionId,
  })
  res.status(201).json(intento)
}

export async function getIntentos(req: Request, res: Response) {
  const intentos = await listarIntentos(req.usuario!, {
    ninoId: req.query.ninoId as string | undefined,
    sesionId: req.query.sesionId as string | undefined,
    actividadId: req.query.actividadId as string | undefined,
    desde: req.query.desde as string | undefined,
    hasta: req.query.hasta as string | undefined,
  })
  res.json(intentos)
}
