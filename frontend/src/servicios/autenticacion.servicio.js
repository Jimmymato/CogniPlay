import clienteApi from './clienteApi'

// Llamadas HTTP relacionadas con la autenticación. Toda la comunicación con la
// API se concentra aquí; los componentes nunca llaman a axios directamente.

// Inicia sesión y devuelve `{ token, usuario }`.
export async function iniciarSesion(correo, contrasena) {
  const { data } = await clienteApi.post('/autenticacion/login', { correo, contrasena })
  return data
}

// Devuelve el perfil del usuario autenticado (valida el token vigente).
export async function obtenerMiPerfil() {
  const { data } = await clienteApi.get('/autenticacion/yo')
  return data
}
