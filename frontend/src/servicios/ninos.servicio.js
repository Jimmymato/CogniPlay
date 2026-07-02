import clienteApi from './clienteApi'

// Gestión de niños por parte del terapeuta. Toda la HTTP vive aquí; los
// componentes nunca llaman a axios directamente.

// Lista los niños del terapeuta autenticado (más recientes primero).
export async function obtenerNinos() {
  const { data } = await clienteApi.get('/ninos')
  return data
}

// Detalle de un niño del terapeuta (info básica y estado).
export async function obtenerNino(ninoId) {
  const { data } = await clienteApi.get(`/ninos/${ninoId}`)
  return data
}

// Registra un nuevo niño (crea su usuario de acceso y su perfil).
export async function crearNino(datos) {
  const { data } = await clienteApi.post('/ninos', datos)
  return data
}

// Activa o desactiva a un niño (sincroniza su acceso al sistema).
export async function cambiarEstadoNino(ninoId, activo) {
  const { data } = await clienteApi.patch(`/ninos/${ninoId}/estado`, { activo })
  return data
}
