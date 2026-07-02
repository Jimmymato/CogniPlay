import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import {
  getNotificaciones,
  patchNotificacionLeida,
} from './notificaciones.controlador'

// Notificaciones del terapeuta.
export const rutasNotificaciones = Router()

rutasNotificaciones.use(autenticar, autorizar('TERAPEUTA'))

rutasNotificaciones.get('/', getNotificaciones)
rutasNotificaciones.patch('/:id/leida', patchNotificacionLeida)
