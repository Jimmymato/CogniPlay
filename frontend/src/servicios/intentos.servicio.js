import clienteApi from './clienteApi'

// Llamadas relacionadas con los intentos del niño.

// Lista los intentos del usuario en sesión. El niño solo recibe los suyos
// (el backend resuelve el niño a partir del token).
export async function obtenerMisIntentos() {
  const { data } = await clienteApi.get('/intentos')
  return data
}

// Registra un nuevo intento del niño. Se usará al terminar una actividad
// en la Subfase 5.4; la respuesta incluye la decisión del motor adaptativo.
export async function registrarIntento(datos) {
  const { data } = await clienteApi.post('/intentos', datos)
  return data
}

// Intentos de un niño para el terapeuta, con filtros opcionales por
// actividad y rango de fechas (instantes ISO).
export async function obtenerIntentosNino(ninoId, { actividadId, desde, hasta } = {}) {
  const { data } = await clienteApi.get('/intentos', {
    params: { ninoId, actividadId, desde, hasta },
  })
  return data
}
