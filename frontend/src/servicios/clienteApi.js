import axios from 'axios'
import { CLAVE_TOKEN, CLAVE_USUARIO } from '../constantes/almacenamiento'

// Cliente HTTP único de la aplicación. Centralizar aquí la comunicación con la
// API evita repetir la URL base y la lógica de autenticación en cada llamada.
const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor de petición: adjunta el token JWT (si existe) en cada llamada,
// de modo que los componentes no tengan que preocuparse por la autenticación.
clienteApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: normaliza el mensaje de error del backend
// (que llega como `{ error: "..." }`) y maneja el 401 de forma global:
// si el token caducó o es inválido, se limpia la sesión y se vuelve al login.
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status
    const mensaje =
      error.response?.data?.error ??
      error.message ??
      'Ocurrió un error inesperado'

    if (estado === 401) {
      localStorage.removeItem(CLAVE_TOKEN)
      localStorage.removeItem(CLAVE_USUARIO)
      // Evita un bucle de redirección si ya estamos en el login.
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    // Se rechaza con un error de mensaje legible para que la UI lo muestre.
    return Promise.reject(Object.assign(error, { mensaje }))
  },
)

export default clienteApi
