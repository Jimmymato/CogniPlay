import type { NextFunction, Request, Response } from 'express'
import { noAutorizado, prohibido } from '../utiles/errores'
import { verificarToken, type CargaToken } from '../utiles/jwt'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: CargaToken
    }
  }
}

export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const cabecera = req.headers.authorization
  if (!cabecera?.startsWith('Bearer ')) {
    throw noAutorizado('Token no proporcionado')
  }
  const token = cabecera.slice(7)
  try {
    req.usuario = verificarToken(token)
  } catch {
    throw noAutorizado('Token inválido o expirado')
  }
  next()
}

export const autorizar =
  (...roles: CargaToken['rol'][]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      throw prohibido('No tienes permiso para esta acción')
    }
    next()
  }
