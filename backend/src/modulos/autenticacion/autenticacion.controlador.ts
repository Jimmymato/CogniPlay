import type { Request, Response } from 'express'
import { solicitudInvalida } from '../../utiles/errores'
import { iniciarSesion, obtenerPerfil } from './autenticacion.servicio'

export async function postLogin(req: Request, res: Response) {
  const { correo, contrasena } = req.body ?? {}
  if (!correo || !contrasena) {
    throw solicitudInvalida('Correo y contraseña son obligatorios')
  }
  const resultado = await iniciarSesion({ correo, contrasena })
  res.json(resultado)
}

export async function getMiPerfil(req: Request, res: Response) {
  const perfil = await obtenerPerfil(req.usuario!.usuarioId)
  res.json(perfil)
}
