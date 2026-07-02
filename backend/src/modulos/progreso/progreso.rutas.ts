import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import {
  getDecisiones,
  getProgreso,
  patchBloqueo,
  patchNivel,
} from './progreso.controlador'

// Progreso y decisiones (montadas bajo /api). El GET de progreso lo usan
// ambos roles (el niño ve su candado); el resto es solo del terapeuta.
export const rutasProgreso = Router()

rutasProgreso.use(autenticar)

rutasProgreso.get('/progreso', getProgreso)
rutasProgreso.get('/decisiones', autorizar('TERAPEUTA'), getDecisiones)
rutasProgreso.patch('/progreso/nivel', autorizar('TERAPEUTA'), patchNivel)
rutasProgreso.patch('/progreso/bloqueo', autorizar('TERAPEUTA'), patchBloqueo)
