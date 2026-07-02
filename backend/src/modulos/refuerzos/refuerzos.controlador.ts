import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import {
  asignarRefuerzo,
  cambiarEstadoRefuerzo,
  listarRefuerzos,
} from './refuerzos.servicio'

export async function getRefuerzos(req: Request, res: Response) {
  const ninoId = req.query.ninoId as string | undefined
  const estado = req.query.estado as string | undefined
  const refuerzos = await listarRefuerzos(req.usuario!.usuarioId, ninoId, estado)
  res.json(refuerzos)
}

export async function postRefuerzo(req: Request, res: Response) {
  const { ninoId, funcionEjecutivaId, actividadId, motivo } = req.body ?? {}
  if (!ninoId || !funcionEjecutivaId || !motivo) {
    throw solicitudInvalida(
      'Los campos "ninoId", "funcionEjecutivaId" y "motivo" son obligatorios',
    )
  }
  const refuerzo = await asignarRefuerzo(req.usuario!.usuarioId, {
    ninoId,
    funcionEjecutivaId,
    actividadId,
    motivo,
  })
  res.status(201).json(refuerzo)
}

export async function patchRefuerzo(req: Request, res: Response) {
  const { estado } = req.body ?? {}
  const refuerzo = await cambiarEstadoRefuerzo(
    req.usuario!.usuarioId,
    req.params.id as string,
    estado,
  )
  res.json(refuerzo)
}
