import type { Request, Response } from 'express'
import { listarNotificaciones, marcarLeida } from './notificaciones.servicio'

export async function getNotificaciones(req: Request, res: Response) {
  const leidaParam = req.query.leida as string | undefined
  const leida =
    leidaParam === undefined ? undefined : leidaParam === 'true'
  const notificaciones = await listarNotificaciones(req.usuario!.usuarioId, leida)
  res.json(notificaciones)
}

export async function patchNotificacionLeida(req: Request, res: Response) {
  const notif = await marcarLeida(req.usuario!.usuarioId, req.params.id as string)
  res.json(notif)
}
