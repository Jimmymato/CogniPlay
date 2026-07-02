import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hand, Frown, Inbox } from 'lucide-react'
import BarraSuperior from '../../componentes/BarraSuperior'
import TarjetaActividad from '../../componentes/TarjetaActividad'
import PantallaCargando from '../../componentes/PantallaCargando'
import EstadoVacio from '../../componentes/EstadoVacio'
import { useAuth } from '../autenticacion/ContextoAuth'
import { obtenerFunciones } from '../../servicios/catalogo.servicio'
import { obtenerMisIntentos } from '../../servicios/intentos.servicio'
import { obtenerMiProgreso } from '../../servicios/progreso.servicio'
import { rutaActividadNino } from '../../app/enrutador/rutas'

// Construye un mapa actividadId → intento más reciente, a partir de la lista
// de intentos (que llega ordenada de más nuevo a más antiguo).
function mapearUltimoIntento(intentos) {
  const mapa = new Map()
  for (const intento of intentos) {
    if (!mapa.has(intento.actividadId)) {
      mapa.set(intento.actividadId, intento)
    }
  }
  return mapa
}

// Saludo según la hora del día.
function saludoPorHora() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// Panel de inicio del niño: muestra las actividades que puede jugar, agrupadas
// por función ejecutiva, con su última precisión cuando ya las ha practicado.
export default function PanelNino() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const nombre = usuario?.perfil?.nombres ?? ''

  const [funciones, setFunciones] = useState([])
  const [intentos, setIntentos] = useState([])
  const [progreso, setProgreso] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)

    // Las actividades son indispensables; los intentos y el progreso son
    // complementarios, por eso un fallo al traerlos no impide ver el tablero.
    Promise.all([
      obtenerFunciones(),
      obtenerMisIntentos().catch(() => []),
      obtenerMiProgreso().catch(() => []),
    ])
      .then(([funcionesObtenidas, intentosObtenidos, progresoObtenido]) => {
        if (!activo) return
        setFunciones(funcionesObtenidas)
        setIntentos(intentosObtenidos)
        setProgreso(progresoObtenido)
      })
      .catch((err) => {
        if (activo) setError(err.mensaje ?? 'No se pudieron cargar tus actividades.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const ultimoPorActividad = useMemo(() => mapearUltimoIntento(intentos), [intentos])

  // Actividades bloqueadas manualmente por el terapeuta.
  const bloqueadas = useMemo(
    () => new Set(progreso.filter((p) => p.bloqueadaManualmente).map((p) => p.actividadId)),
    [progreso],
  )

  // Solo se muestran las funciones que tienen al menos una actividad jugable.
  const funcionesConActividades = funciones.filter((f) => (f.actividades?.length ?? 0) > 0)

  function jugar(actividad) {
    navegar(rutaActividadNino(actividad.id))
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--cp-bg-child)' }}>
      <BarraSuperior />
      <main style={{ padding: '24px 20px 36px', maxWidth: 760, margin: '0 auto' }}>
        <header style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {saludoPorHora()}, {nombre}
            <Hand size={22} color="var(--cp-warm)" aria-hidden="true" />
          </h1>
          <p style={{ color: 'var(--cp-text-2)', fontSize: 14 }}>
            Elige una actividad para empezar a jugar.
          </p>
        </header>

        {cargando && <PantallaCargando mensaje="Cargando tus actividades…" />}

        {!cargando && error && (
          <EstadoVacio
            icono={Frown}
            titulo="Algo salió mal"
            mensaje={error}
          />
        )}

        {!cargando && !error && funcionesConActividades.length === 0 && (
          <EstadoVacio
            icono={Inbox}
            titulo="Todavía no hay actividades"
            mensaje="Cuando tu terapeuta active actividades, aparecerán aquí."
          />
        )}

        {!cargando && !error && funcionesConActividades.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            {funcionesConActividades.map((funcion) => (
              <section key={funcion.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: funcion.color,
                      flexShrink: 0,
                    }}
                  />
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--cp-text-1)' }}>
                    {funcion.etiqueta}
                  </h2>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 12,
                  }}
                >
                  {funcion.actividades.map((actividad) => (
                    <TarjetaActividad
                      key={actividad.id}
                      actividad={actividad}
                      colorFuncion={funcion.color}
                      ultimoIntento={ultimoPorActividad.get(actividad.id)}
                      bloqueada={bloqueadas.has(actividad.id)}
                      onJugar={jugar}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
