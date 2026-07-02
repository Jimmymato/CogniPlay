import clienteApi from './clienteApi'

// Observaciones clínicas del terapeuta sobre un niño. Todo el acceso HTTP
// vive aquí; los componentes consumen estas funciones.

// Lista las observaciones del niño (las más recientes primero).
export async function obtenerObservaciones(ninoId) {
  const { data } = await clienteApi.get('/observaciones', { params: { ninoId } })
  return data
}

// Registra una nueva observación sobre el niño.
export async function crearObservacion({ ninoId, texto }) {
  const { data } = await clienteApi.post('/observaciones', { ninoId, texto })
  return data
}
