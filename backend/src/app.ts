import cors from 'cors'
import express from 'express'
import { manejadorErrores } from './middlewares/manejadorErrores'
import { rutasAutenticacion } from './modulos/autenticacion/autenticacion.rutas'
import { rutasCatalogo } from './modulos/catalogo/catalogo.rutas'
import { rutasIntentos } from './modulos/intentos/intentos.rutas'
import { rutasNinos } from './modulos/ninos/ninos.rutas'
import { rutasNotificaciones } from './modulos/notificaciones/notificaciones.rutas'
import { rutasObservaciones } from './modulos/observaciones/observaciones.rutas'
import { rutasProgreso } from './modulos/progreso/progreso.rutas'
import { rutasRefuerzos } from './modulos/refuerzos/refuerzos.rutas'
import { rutasSesiones } from './modulos/sesiones/sesiones.rutas'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/salud', (_req, res) => {
  res.json({
    estado: 'ok',
    servicio: 'CogniPlay API',
    hora: new Date().toISOString(),
  })
})

app.use('/api/autenticacion', rutasAutenticacion)
app.use('/api/ninos', rutasNinos)
app.use('/api', rutasCatalogo)
app.use('/api/sesiones', rutasSesiones)
app.use('/api/intentos', rutasIntentos)
app.use('/api', rutasProgreso)
app.use('/api/refuerzos', rutasRefuerzos)
app.use('/api/notificaciones', rutasNotificaciones)
app.use('/api/observaciones', rutasObservaciones)

app.use(manejadorErrores)
