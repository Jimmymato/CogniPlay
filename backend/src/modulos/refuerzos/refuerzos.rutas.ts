import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import {
  getRefuerzos,
  patchRefuerzo,
  postRefuerzo,
} from './refuerzos.controlador'

// Gestión de refuerzos por el terapeuta.
export const rutasRefuerzos = Router()

rutasRefuerzos.use(autenticar, autorizar('TERAPEUTA'))

rutasRefuerzos.get('/', getRefuerzos)
rutasRefuerzos.post('/', postRefuerzo)
rutasRefuerzos.patch('/:id', patchRefuerzo)
