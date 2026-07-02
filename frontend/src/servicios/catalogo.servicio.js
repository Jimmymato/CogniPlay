import clienteApi from './clienteApi'

// Llamadas al catálogo de solo lectura (funciones ejecutivas y actividades).
// Los componentes nunca llaman a axios directamente: todo pasa por aquí.

// Devuelve las 7 funciones ejecutivas con sus actividades activas y niveles.
export async function obtenerFunciones() {
  const { data } = await clienteApi.get('/funciones')
  return data
}

// Devuelve una actividad por su id, con su función ejecutiva y niveles.
export async function obtenerActividad(id) {
  const { data } = await clienteApi.get(`/actividades/${id}`)
  return data
}
