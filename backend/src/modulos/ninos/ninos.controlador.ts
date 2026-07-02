import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import {
  actualizarNino,
  cambiarEstadoNino,
  crearNino,
  listarNinos,
  obtenerNino,
} from './ninos.servicio'

export async function postNino(req: Request, res: Response) {
  const { correo, contrasena, nombres, apellidos, fechaNacimiento } = req.body ?? {}
  if (!correo || !contrasena || !nombres || !apellidos || !fechaNacimiento) {
    throw solicitudInvalida(
      'Correo, contraseña, nombres, apellidos y fecha de nacimiento son obligatorios',
    )
  }
  const nino = await crearNino(req.usuario!.usuarioId, {
    correo,
    contrasena,
    nombres,
    apellidos,
    fechaNacimiento,
  })
  res.status(201).json(nino)
}

export async function getNinos(req: Request, res: Response) {
  const ninos = await listarNinos(req.usuario!.usuarioId)
  res.json(ninos)
}

export async function getNino(req: Request, res: Response) {
  const nino = await obtenerNino(req.usuario!.usuarioId, req.params.id as string)
  res.json(nino)
}

export async function patchNino(req: Request, res: Response) {
  const { nombres, apellidos, fechaNacimiento } = req.body ?? {}
  if (nombres === undefined && apellidos === undefined && fechaNacimiento === undefined) {
    throw solicitudInvalida('No hay datos para actualizar')
  }
  const nino = await actualizarNino(req.usuario!.usuarioId, req.params.id as string, {
    nombres,
    apellidos,
    fechaNacimiento,
  })
  res.json(nino)
}

export async function patchEstadoNino(req: Request, res: Response) {
  const { activo } = req.body ?? {}
  if (typeof activo !== 'boolean') {
    throw solicitudInvalida('El campo "activo" debe ser verdadero o falso')
  }
  const nino = await cambiarEstadoNino(req.usuario!.usuarioId, req.params.id as string, activo)
  res.json(nino)
}
