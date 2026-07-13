import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Frown } from 'lucide-react'
import BarraSuperior from '../../componentes/BarraSuperior'
import PantallaCargando from '../../componentes/PantallaCargando'
import EstadoVacio from '../../componentes/EstadoVacio'
import useMediaQuery, { CONSULTA_ESCRITORIO } from '../../hooks/useMediaQuery'
import { obtenerNino } from '../../servicios/ninos.servicio'
import { obtenerFunciones } from '../../servicios/catalogo.servicio'
import {
  obtenerProgresoNino,
  obtenerDecisionesNino,
} from '../../servicios/progreso.servicio'
import { obtenerIntentosNino } from '../../servicios/intentos.servicio'
import { obtenerRefuerzos } from '../../servicios/refuerzos.servicio'
import { obtenerObservaciones } from '../../servicios/observaciones.servicio'
import { RUTAS } from '../../app/enrutador/rutas'
import TarjetaPaciente from './detalle/TarjetaPaciente'
import AreasDesempeno from './detalle/AreasDesempeno'
import SeccionObservaciones from './detalle/SeccionObservaciones'
import SeccionProgresoActividades from './detalle/SeccionProgresoActividades'
import GraficosEvolucion from './detalle/GraficosEvolucion'
import HistorialIntentos from './detalle/HistorialIntentos'
import HistorialDecisiones from './detalle/HistorialDecisiones'
import ModalControlNivel from './detalle/ModalControlNivel'
import ModalControlBloqueo from './detalle/ModalControlBloqueo'
import ModalAsignarRefuerzo from './detalle/ModalAsignarRefuerzo'
import { botonSecundario } from './detalle/estilos'

// Vista individual del niño para el terapeuta (Subfase 5.6): identidad y
// avance, progreso por actividad con controles manuales, gráficos de
// evolución, áreas de desempeño, historiales y observaciones clínicas.
export default function DetalleNino() {
  const { ninoId } = useParams()
  const navegar = useNavigate()
  const esEscritorio = useMediaQuery(CONSULTA_ESCRITORIO)

  const [nino, setNino] = useState(null)
  const [funciones, setFunciones] = useState([])
  const [progreso, setProgreso] = useState([])
  const [intentos, setIntentos] = useState([])
  const [decisiones, setDecisiones] = useState([])
  const [refuerzos, setRefuerzos] = useState([])
  const [observaciones, setObservaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Modal activo: { tipo: 'nivel' | 'bloqueo' | 'refuerzo', actividad?, fila? }
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)

    // El niño y el catálogo son indispensables; el resto es complementario y
    // su fallo no impide ver la vista (patrón del panel del terapeuta).
    Promise.all([
      obtenerNino(ninoId),
      obtenerFunciones(),
      obtenerProgresoNino(ninoId).catch(() => []),
      obtenerIntentosNino(ninoId).catch(() => []),
      obtenerDecisionesNino(ninoId).catch(() => []),
      obtenerRefuerzos({ ninoId }).catch(() => []),
      obtenerObservaciones(ninoId).catch(() => []),
    ])
      .then(([ninoDatos, funcionesDatos, progresoDatos, intentosDatos, decisionesDatos, refuerzosDatos, observacionesDatos]) => {
        if (!activo) return
        setNino(ninoDatos)
        setFunciones(funcionesDatos)
        setProgreso(progresoDatos)
        setIntentos(intentosDatos)
        setDecisiones(decisionesDatos)
        setRefuerzos(refuerzosDatos)
        setObservaciones(observacionesDatos)
      })
      .catch((err) => {
        if (activo) setError(err.mensaje ?? 'No se pudo cargar la información del niño.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [ninoId])

  // Refetch selectivos tras las acciones de los modales.
  const recargarProgresoYDecisiones = useCallback(() => {
    obtenerProgresoNino(ninoId).then(setProgreso).catch(() => {})
    obtenerDecisionesNino(ninoId).then(setDecisiones).catch(() => {})
  }, [ninoId])

  const recargarRefuerzos = useCallback(() => {
    obtenerRefuerzos({ ninoId }).then(setRefuerzos).catch(() => {})
  }, [ninoId])

  const recargarObservaciones = useCallback(() => {
    obtenerObservaciones(ninoId).then(setObservaciones).catch(() => {})
  }, [ninoId])

  const actividades = useMemo(
    () => funciones.flatMap((f) => f.actividades ?? []),
    [funciones],
  )
  const actividadesSuperadas = progreso.filter((p) => p.nivelSuperado).length

  function cerrarModal() {
    setModal(null)
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--cp-bg)' }}>
      <BarraSuperior />
      <main style={{ padding: '20px 20px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navegar(RUTAS.terapeuta)}
          style={{ ...botonSecundario, marginBottom: 16 }}
        >
          ← Volver al panel
        </button>

        {cargando && <PantallaCargando mensaje="Cargando la información del niño…" />}

        {!cargando && error && (
          <EstadoVacio icono={Frown} titulo="Algo salió mal" mensaje={error} />
        )}

        {!cargando && !error && nino && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: esEscritorio
                ? 'minmax(300px, 360px) minmax(0, 1fr)'
                : 'minmax(0, 1fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* Columna izquierda: identidad, desempeño y observaciones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TarjetaPaciente
                nino={nino}
                actividadesSuperadas={actividadesSuperadas}
                totalActividades={actividades.length}
                totalIntentos={intentos.length}
              />
              <AreasDesempeno
                funciones={funciones}
                intentos={intentos}
                refuerzos={refuerzos}
                onAsignarRefuerzo={() => setModal({ tipo: 'refuerzo' })}
              />
              <SeccionObservaciones
                ninoId={ninoId}
                observaciones={observaciones}
                onCreada={recargarObservaciones}
              />
            </div>

            {/* Columna derecha: progreso, evolución e historiales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SeccionProgresoActividades
                funciones={funciones}
                progreso={progreso}
                onCambiarNivel={(actividad, fila) =>
                  setModal({ tipo: 'nivel', actividad, fila })
                }
                onCambiarBloqueo={(actividad, fila) =>
                  setModal({ tipo: 'bloqueo', actividad, fila })
                }
              />
              <GraficosEvolucion intentos={intentos} />
              <HistorialIntentos ninoId={ninoId} actividades={actividades} />
              <HistorialDecisiones decisiones={decisiones} />
            </div>
          </div>
        )}
      </main>

      {modal?.tipo === 'nivel' && (
        <ModalControlNivel
          ninoId={ninoId}
          actividad={modal.actividad}
          nivelActual={modal.fila?.nivelActual ?? null}
          onExito={() => {
            recargarProgresoYDecisiones()
            cerrarModal()
          }}
          onCerrar={cerrarModal}
        />
      )}
      {modal?.tipo === 'bloqueo' && (
        <ModalControlBloqueo
          ninoId={ninoId}
          actividad={modal.actividad}
          bloqueada={modal.fila?.bloqueadaManualmente ?? false}
          onExito={() => {
            recargarProgresoYDecisiones()
            cerrarModal()
          }}
          onCerrar={cerrarModal}
        />
      )}
      {modal?.tipo === 'refuerzo' && (
        <ModalAsignarRefuerzo
          ninoId={ninoId}
          funciones={funciones}
          onExito={() => {
            recargarRefuerzos()
            cerrarModal()
          }}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  )
}
