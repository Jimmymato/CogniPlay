import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import {
  getNino,
  getNinos,
  patchEstadoNino,
  patchNino,
  postNino,
} from './ninos.controlador'

export const rutasNinos = Router()

// Todas las rutas requieren un terapeuta autenticado.
rutasNinos.use(autenticar, autorizar('TERAPEUTA'))

rutasNinos.post('/', postNino)
rutasNinos.get('/', getNinos)
rutasNinos.get('/:id', getNino)
rutasNinos.patch('/:id', patchNino)
rutasNinos.patch('/:id/estado', patchEstadoNino)
