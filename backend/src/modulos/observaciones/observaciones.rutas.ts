import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import { getObservaciones, postObservacion } from './observaciones.controlador'

// Observaciones clínicas del terapeuta sobre sus niños.
export const rutasObservaciones = Router()

rutasObservaciones.use(autenticar, autorizar('TERAPEUTA'))

rutasObservaciones.get('/', getObservaciones)
rutasObservaciones.post('/', postObservacion)
