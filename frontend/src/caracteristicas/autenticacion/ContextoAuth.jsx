import { createContext, useContext, useEffect, useState } from 'react'
import { CLAVE_TOKEN, CLAVE_USUARIO } from '../../constantes/almacenamiento'
import {
  iniciarSesion,
  obtenerMiPerfil,
} from '../../servicios/autenticacion.servicio'

const ContextoAuth = createContext(null)

// Proveedor de autenticación: mantiene el usuario en sesión, persiste el token
// en localStorage y expone las acciones de login y logout a toda la aplicación.
export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_USUARIO)
    return guardado ? JSON.parse(guardado) : null
  })
  const [cargando, setCargando] = useState(true)

  // Al arrancar, si hay token guardado se valida contra el backend para
  // refrescar el perfil; si es inválido, el interceptor de 401 limpia la sesión.
  useEffect(() => {
    const token = localStorage.getItem(CLAVE_TOKEN)
    if (!token) {
      setCargando(false)
      return
    }
    obtenerMiPerfil()
      .then((perfil) => {
        setUsuario(perfil)
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(perfil))
      })
      .catch(() => {
        localStorage.removeItem(CLAVE_TOKEN)
        localStorage.removeItem(CLAVE_USUARIO)
        setUsuario(null)
      })
      .finally(() => setCargando(false))
  }, [])

  async function login(correo, contrasena) {
    const { token, usuario: autenticado } = await iniciarSesion(correo, contrasena)
    localStorage.setItem(CLAVE_TOKEN, token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(autenticado))
    setUsuario(autenticado)
    return autenticado
  }

  function logout() {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setUsuario(null)
  }

  return (
    <ContextoAuth.Provider
      value={{ usuario, autenticado: Boolean(usuario), cargando, login, logout }}
    >
      {children}
    </ContextoAuth.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(ContextoAuth)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un ProveedorAuth')
  }
  return contexto
}
