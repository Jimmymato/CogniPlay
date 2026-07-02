import jwt from 'jsonwebtoken'
import type { RolUsuario } from '@prisma/client'
import { entorno } from '../config/entorno'

export interface CargaToken {
  usuarioId: string
  rol: RolUsuario
}

export const firmarToken = (carga: CargaToken) =>
  jwt.sign(carga, entorno.jwtSecret, { expiresIn: entorno.jwtExpiracion } as jwt.SignOptions)

export const verificarToken = (token: string): CargaToken =>
  jwt.verify(token, entorno.jwtSecret) as CargaToken
