import type { Request, Response } from 'express'
import { listarFunciones, obtenerActividad } from './catalogo.servicio'

export async function getFunciones(_req: Request, res: Response) {
  const funciones = await listarFunciones()
  res.json(funciones)
}

export async function getActividad(req: Request, res: Response) {
  const actividad = await obtenerActividad(req.params.id as string)
  res.json(actividad)
}
