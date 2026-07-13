import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../caracteristicas/autenticacion/ContextoAuth'
import PantallaLogin from '../../caracteristicas/autenticacion/PantallaLogin'
import PantallaCargando from '../../componentes/PantallaCargando'
import RutaProtegida from './RutaProtegida'
import { RUTAS, rutaInicioPorRol } from './rutas'

// Las pantallas se cargan bajo demanda (code splitting): así el bundle
// inicial no arrastra Recharts ni los juegos, que pesan y solo se usan
// en sus propias rutas.
const PanelTerapeuta = lazy(() => import('../../caracteristicas/tableroTerapeuta/PanelTerapeuta'))
const DetalleNino = lazy(() => import('../../caracteristicas/tableroTerapeuta/DetalleNino'))
const PantallaReportes = lazy(() => import('../../caracteristicas/reportes/PantallaReportes'))
const PanelNino = lazy(() => import('../../caracteristicas/tableroNino/PanelNino'))
const PantallaActividad = lazy(() => import('../../caracteristicas/actividades/PantallaActividad'))

// Reubica la ruta raíz según el estado de sesión y el rol del usuario.
function InicioRedireccion() {
  const { autenticado, usuario, cargando } = useAuth()
  if (cargando) return <PantallaCargando mensaje="Verificando sesión…" />
  if (!autenticado) return <Navigate to={RUTAS.login} replace />
  return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />
}

export default function Enrutador() {
  return (
    <Suspense fallback={<PantallaCargando mensaje="Cargando…" />}>
      <Routes>
        <Route path={RUTAS.login} element={<PantallaLogin />} />

        <Route element={<RutaProtegida rol="TERAPEUTA" />}>
          <Route path={RUTAS.terapeuta} element={<PanelTerapeuta />} />
          <Route path={RUTAS.reportes} element={<PantallaReportes />} />
          <Route path={RUTAS.detalleNino} element={<DetalleNino />} />
        </Route>

        <Route element={<RutaProtegida rol="NINO" />}>
          <Route path={RUTAS.nino} element={<PanelNino />} />
          <Route path={RUTAS.actividadNino} element={<PantallaActividad />} />
        </Route>

        <Route path={RUTAS.inicio} element={<InicioRedireccion />} />
        <Route path="*" element={<Navigate to={RUTAS.inicio} replace />} />
      </Routes>
    </Suspense>
  )
}
