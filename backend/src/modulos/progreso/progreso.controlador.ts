import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import {
  cambiarBloqueoManual,
  cambiarNivelManual,
  listarDecisionesNino,
  listarMiProgreso,
  listarProgresoNino,
} from './progreso.servicio'

export async function getProgreso(req: Request, res: Response) {
  // El niño solo puede consultar su propio progreso (ignora el query).
  if (req.usuario!.rol === 'NINO') {
    const progreso = await listarMiProgreso(req.usuario!.usuarioId)
    res.json(progreso)
    return
  }
  const ninoId = req.query.ninoId as string | undefined
  if (!ninoId) throw solicitudInvalida('El parámetro "ninoId" es obligatorio')
  const progreso = await listarProgresoNino(req.usuario!.usuarioId, ninoId)
  res.json(progreso)
}

export async function getDecisiones(req: Request, res: Response) {
  const ninoId = req.query.ninoId as string | undefined
  if (!ninoId) throw solicitudInvalida('El parámetro "ninoId" es obligatorio')
  const actividadId = req.query.actividadId as string | undefined
  const decisiones = await listarDecisionesNino(
    req.usuario!.usuarioId,
    ninoId,
    actividadId,
  )
  res.json(decisiones)
}

export async function patchNivel(req: Request, res: Response) {
  const { ninoId, actividadId, nivel, razon } = req.body ?? {}
  if (!ninoId || !actividadId || !nivel) {
    throw solicitudInvalida(
      'Los campos "ninoId", "actividadId" y "nivel" son obligatorios',
    )
  }
  const resultado = await cambiarNivelManual(req.usuario!.usuarioId, {
    ninoId,
    actividadId,
    nivel,
    razon,
  })
  res.json(resultado)
}

export async function patchBloqueo(req: Request, res: Response) {
  const { ninoId, actividadId, bloqueada, razon } = req.body ?? {}
  if (!ninoId || !actividadId || bloqueada === undefined) {
    throw solicitudInvalida(
      'Los campos "ninoId", "actividadId" y "bloqueada" son obligatorios',
    )
  }
  const resultado = await cambiarBloqueoManual(req.usuario!.usuarioId, {
    ninoId,
    actividadId,
    bloqueada,
    razon,
  })
  res.json(resultado)
}
