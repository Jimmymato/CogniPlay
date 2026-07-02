import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import { getIntentos, postIntento } from './intentos.controlador'

export const rutasIntentos = Router()

rutasIntentos.use(autenticar)

// Solo el niño registra sus propios intentos; el listado lo ven ambos roles.
rutasIntentos.post('/', autorizar('NINO'), postIntento)
rutasIntentos.get('/', getIntentos)
