import clienteApi from './clienteApi'

// Lecturas de progreso del niño para el terapeuta. Todo el acceso HTTP vive
// aquí; los componentes consumen estas funciones.

// Progreso por actividad de un niño (nivel actual, si está desbloqueada y si
// ya superó el nivel difícil). Se usa a fondo en la vista individual (5.6).
export async function obtenerProgresoNino(ninoId) {
  const { data } = await clienteApi.get('/progreso', { params: { ninoId } })
  return data
}

// Historial de decisiones del motor adaptativo del niño (filtro opcional por
// actividad). Se usará en la vista individual (5.6).
export async function obtenerDecisionesNino(ninoId, actividadId) {
  const { data } = await clienteApi.get('/decisiones', {
    params: { ninoId, actividadId },
  })
  return data
}

// Progreso del propio niño autenticado (para mostrar candados en su panel).
export async function obtenerMiProgreso() {
  const { data } = await clienteApi.get('/progreso')
  return data
}

// Cambio manual de dificultad por el terapeuta (registra decisión manual).
export async function cambiarNivelActividad({ ninoId, actividadId, nivel, razon }) {
  const { data } = await clienteApi.patch('/progreso/nivel', {
    ninoId,
    actividadId,
    nivel,
    razon,
  })
  return data
}

// Bloqueo/desbloqueo manual de una actividad para un niño.
export async function cambiarBloqueoActividad({ ninoId, actividadId, bloqueada, razon }) {
  const { data } = await clienteApi.patch('/progreso/bloqueo', {
    ninoId,
    actividadId,
    bloqueada,
    razon,
  })
  return data
}
