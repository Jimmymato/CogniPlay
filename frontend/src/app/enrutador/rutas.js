// Rutas de la aplicación, centralizadas para evitar cadenas sueltas.
export const RUTAS = {
  login: '/login',
  inicio: '/',
  terapeuta: '/terapeuta',
  detalleNino: '/terapeuta/nino/:ninoId',
  nino: '/nino',
  actividadNino: '/nino/actividad/:actividadId',
}

// Devuelve la ruta de inicio que corresponde a cada rol tras autenticarse.
export function rutaInicioPorRol(rol) {
  return rol === 'TERAPEUTA' ? RUTAS.terapeuta : RUTAS.nino
}

// Construye la ruta para jugar una actividad concreta.
export function rutaActividadNino(actividadId) {
  return `/nino/actividad/${actividadId}`
}

// Construye la ruta al detalle de un niño (vista del terapeuta).
export function rutaDetalleNino(ninoId) {
  return `/terapeuta/nino/${ninoId}`
}
