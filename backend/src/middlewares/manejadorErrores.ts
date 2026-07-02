import type { NextFunction, Request, Response } from 'express'
import { ErrorHttp } from '../utiles/errores'

export function manejadorErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ErrorHttp) {
    return res.status(error.estado).json({ error: error.message })
  }
  console.error('Error no controlado:', error)
  return res.status(500).json({ error: 'Error interno del servidor' })
}
