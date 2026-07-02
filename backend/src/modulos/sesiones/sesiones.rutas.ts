import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import {
  getRecomendaciones,
  getSesion,
  getSesiones,
  postCerrarSesion,
  postSesion,
} from './sesiones.controlador'

// Las sesiones las gestiona el terapeuta.
export const rutasSesiones = Router()

rutasSesiones.use(autenticar, autorizar('TERAPEUTA'))

rutasSesiones.post('/', postSesion)
rutasSesiones.get('/', getSesiones)
rutasSesiones.get('/:id', getSesion)
rutasSesiones.get('/:id/recomendaciones', getRecomendaciones)
rutasSesiones.patch('/:id/cerrar', postCerrarSesion)
