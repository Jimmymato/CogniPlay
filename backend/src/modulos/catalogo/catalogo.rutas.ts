import { Router } from 'express'
import { autenticar } from '../../middlewares/autenticacion'
import { getActividad, getFunciones } from './catalogo.controlador'

// Catálogo de solo lectura: accesible por cualquier usuario autenticado (terapeuta o niño).
export const rutasCatalogo = Router()

rutasCatalogo.use(autenticar)

rutasCatalogo.get('/funciones', getFunciones)
rutasCatalogo.get('/actividades/:id', getActividad)
