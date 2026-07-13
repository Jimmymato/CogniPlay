import cors from 'cors'
import express from 'express'
import { entorno } from './config/entorno'
import { manejadorErrores } from './middlewares/manejadorErrores'
import { rutasAutenticacion } from './modulos/autenticacion/autenticacion.rutas'
import { rutasCatalogo } from './modulos/catalogo/catalogo.rutas'
import { rutasIntentos } from './modulos/intentos/intentos.rutas'
import { rutasNinos } from './modulos/ninos/ninos.rutas'
import { rutasNotificaciones } from './modulos/notificaciones/notificaciones.rutas'
import { rutasObservaciones } from './modulos/observaciones/observaciones.rutas'
import { rutasProgreso } from './modulos/progreso/progreso.rutas'
import { rutasRefuerzos } from './modulos/refuerzos/refuerzos.rutas'
import { rutasReportes } from './modulos/reportes/reportes.rutas'
import { rutasSesiones } from './modulos/sesiones/sesiones.rutas'

export const app = express()

// Content-Disposition se expone para que el navegador pueda leer el nombre
// de archivo sugerido en las descargas de reportes.
// Si CORS_ORIGEN está definida, solo se aceptan peticiones desde esos
// orígenes; sin definir, se aceptan todos (útil en desarrollo local).
app.use(
  cors({
    origin: entorno.corsOrigenes.length > 0 ? entorno.corsOrigenes : true,
    exposedHeaders: ['Content-Disposition'],
  }),
)
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
app.use('/api/reportes', rutasReportes)
app.use('/api/notificaciones', rutasNotificaciones)
app.use('/api/observaciones', rutasObservaciones)

app.use(manejadorErrores)
