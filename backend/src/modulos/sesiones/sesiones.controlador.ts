import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import { listarRecomendaciones } from '../recomendaciones/recomendaciones.servicio'
import {
  abrirSesion,
  cerrarSesion,
  listarSesiones,
  obtenerSesion,
} from './sesiones.servicio'

export async function postSesion(req: Request, res: Response) {
  const { ninoId } = req.body ?? {}
  if (!ninoId) throw solicitudInvalida('El campo "ninoId" es obligatorio')
  const sesion = await abrirSesion(req.usuario!.usuarioId, ninoId)
  res.status(201).json(sesion)
}

export async function getSesiones(req: Request, res: Response) {
  const ninoId = req.query.ninoId as string | undefined
  const sesiones = await listarSesiones(req.usuario!.usuarioId, ninoId)
  res.json(sesiones)
}

export async function getSesion(req: Request, res: Response) {
  const sesion = await obtenerSesion(req.usuario!.usuarioId, req.params.id as string)
  res.json(sesion)
}

export async function postCerrarSesion(req: Request, res: Response) {
  const sesion = await cerrarSesion(req.usuario!.usuarioId, req.params.id as string)
  res.json(sesion)
}

export async function getRecomendaciones(req: Request, res: Response) {
  const recomendaciones = await listarRecomendaciones(
    req.usuario!.usuarioId,
    req.params.id as string,
  )
  res.json(recomendaciones)
}
