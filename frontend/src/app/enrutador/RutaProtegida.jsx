import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../caracteristicas/autenticacion/ContextoAuth'
import PantallaCargando from '../../componentes/PantallaCargando'

// Protege un grupo de rutas: exige sesión iniciada y, opcionalmente, un rol.
// - Mientras se valida la sesión muestra el indicador de carga.
// - Sin sesión redirige al login.
// - Con un rol distinto al exigido redirige al inicio (que reubica por rol).
export default function RutaProtegida({ rol }) {
  const { autenticado, usuario, cargando } = useAuth()

  if (cargando) return <PantallaCargando mensaje="Verificando sesión…" />
  if (!autenticado) return <Navigate to="/login" replace />
  if (rol && usuario.rol !== rol) return <Navigate to="/" replace />

  return <Outlet />
}
