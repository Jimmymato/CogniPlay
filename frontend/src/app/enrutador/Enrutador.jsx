import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../caracteristicas/autenticacion/ContextoAuth'
import PantallaLogin from '../../caracteristicas/autenticacion/PantallaLogin'
import PanelTerapeuta from '../../caracteristicas/tableroTerapeuta/PanelTerapeuta'
import DetalleNino from '../../caracteristicas/tableroTerapeuta/DetalleNino'
import PanelNino from '../../caracteristicas/tableroNino/PanelNino'
import PantallaActividad from '../../caracteristicas/actividades/PantallaActividad'
import PantallaCargando from '../../componentes/PantallaCargando'
import RutaProtegida from './RutaProtegida'
import { RUTAS, rutaInicioPorRol } from './rutas'

// Reubica la ruta raíz según el estado de sesión y el rol del usuario.
function InicioRedireccion() {
  const { autenticado, usuario, cargando } = useAuth()
  if (cargando) return <PantallaCargando mensaje="Verificando sesión…" />
  if (!autenticado) return <Navigate to={RUTAS.login} replace />
  return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />
}

export default function Enrutador() {
  return (
    <Routes>
      <Route path={RUTAS.login} element={<PantallaLogin />} />

      <Route element={<RutaProtegida rol="TERAPEUTA" />}>
        <Route path={RUTAS.terapeuta} element={<PanelTerapeuta />} />
        <Route path={RUTAS.detalleNino} element={<DetalleNino />} />
      </Route>

      <Route element={<RutaProtegida rol="NINO" />}>
        <Route path={RUTAS.nino} element={<PanelNino />} />
        <Route path={RUTAS.actividadNino} element={<PantallaActividad />} />
      </Route>

      <Route path={RUTAS.inicio} element={<InicioRedireccion />} />
      <Route path="*" element={<Navigate to={RUTAS.inicio} replace />} />
    </Routes>
  )
}
