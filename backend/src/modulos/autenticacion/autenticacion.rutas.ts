import { Router } from 'express'
import { autenticar } from '../../middlewares/autenticacion'
import { getMiPerfil, postLogin } from './autenticacion.controlador'

export const rutasAutenticacion = Router()

rutasAutenticacion.post('/login', postLogin)
rutasAutenticacion.get('/yo', autenticar, getMiPerfil)
