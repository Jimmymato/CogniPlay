import clienteApi from './clienteApi'

// Refuerzos de los niños del terapeuta. Todo el acceso HTTP vive aquí.

// Lista los refuerzos, con filtros opcionales por niño y por estado
// (PENDIENTE, EN_PROGRESO, COMPLETADO). Cada refuerzo trae su niño,
// función ejecutiva y actividad asociada.
export async function obtenerRefuerzos({ ninoId, estado } = {}) {
  const { data } = await clienteApi.get('/refuerzos', {
    params: { ninoId, estado },
  })
  return data
}

// Asignación manual de un refuerzo por parte del terapeuta.
export async function asignarRefuerzo({ ninoId, funcionEjecutivaId, actividadId, motivo }) {
  const { data } = await clienteApi.post('/refuerzos', {
    ninoId,
    funcionEjecutivaId,
    actividadId,
    motivo,
  })
  return data
}
