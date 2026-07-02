import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import { crearObservacion, listarObservaciones } from './observaciones.servicio'

export async function getObservaciones(req: Request, res: Response) {
  const ninoId = req.query.ninoId as string | undefined
  if (!ninoId) {
    throw solicitudInvalida('El parámetro "ninoId" es obligatorio')
  }
  const observaciones = await listarObservaciones(req.usuario!.usuarioId, ninoId)
  res.json(observaciones)
}

export async function postObservacion(req: Request, res: Response) {
  const { ninoId, texto } = req.body ?? {}
  if (!ninoId || texto === undefined) {
    throw solicitudInvalida('Los campos "ninoId" y "texto" son obligatorios')
  }
  const observacion = await crearObservacion(req.usuario!.usuarioId, {
    ninoId,
    texto,
  })
  res.status(201).json(observacion)
}
