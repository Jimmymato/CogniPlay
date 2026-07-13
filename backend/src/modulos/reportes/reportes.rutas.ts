import { Router } from 'express'
import { autenticar, autorizar } from '../../middlewares/autenticacion'
import { getExportar, getHistorial, getResumen } from './reportes.controlador'

// Reportes de evolución por niño — solo para el terapeuta responsable.
export const rutasReportes = Router()

rutasReportes.use(autenticar, autorizar('TERAPEUTA'))

rutasReportes.get('/resumen', getResumen)
rutasReportes.get('/historial', getHistorial)
rutasReportes.get('/exportar', getExportar)
