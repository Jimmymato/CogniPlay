import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Frown } from 'lucide-react'
import BarraSuperior from '../../componentes/BarraSuperior'
import PantallaCargando from '../../componentes/PantallaCargando'
import EstadoVacio from '../../componentes/EstadoVacio'
import IconoActividad from '../../componentes/IconoActividad'
import PantallaResultado from './componentes/PantallaResultado'
import { obtenerActividad } from '../../servicios/catalogo.servicio'
import { registrarIntento } from '../../servicios/intentos.servicio'
import { obtenerJuego } from './registroJuegos'
import { RUTAS } from '../../app/enrutador/rutas'

const ORDEN_NIVELES = ['FACIL', 'MEDIO', 'DIFICIL']
const ETIQUETA_NIVEL = { FACIL: 'Fácil', MEDIO: 'Medio', DIFICIL: 'Difícil' }
const DESCRIPCION_NIVEL = {
  FACIL: 'Con pistas y más tiempo',
  MEDIO: 'Sin pistas',
  DIFICIL: 'Más ítems y menos tiempo',
}

// Reproductor de actividades: carga la actividad, deja elegir nivel, monta el
// juego correspondiente dentro de un escenario amplio y, al terminar, registra
// el intento y muestra el resultado con la decisión del motor adaptativo.
export default function PantallaActividad() {
  const { actividadId } = useParams()
  const navegar = useNavigate()

  const [estado, setEstado] = useState('cargando') // cargando|error|seleccion|jugando|enviando|resultado
  const [actividad, setActividad] = useState(null)
  const [nivelElegido, setNivelElegido] = useState(null)
  const [intento, setIntento] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true
    setEstado('cargando')
    obtenerActividad(actividadId)
      .then((a) => {
        if (!activo) return
        setActividad(a)
        setEstado('seleccion')
      })
      .catch((e) => {
        if (!activo) return
        setError(e.mensaje ?? 'No se pudo cargar la actividad.')
        setEstado('error')
      })
    return () => {
      activo = false
    }
  }, [actividadId])

  const color = actividad?.funcionEjecutiva?.color ?? 'var(--cp-purple)'

  const niveles = [...(actividad?.niveles ?? [])].sort(
    (a, b) => ORDEN_NIVELES.indexOf(a.nivel) - ORDEN_NIVELES.indexOf(b.nivel),
  )

  function elegirNivel(nivel) {
    setNivelElegido(nivel)
    setEstado('jugando')
  }

  async function alTerminarJuego(resultado) {
    setEstado('enviando')
    try {
      const respuesta = await registrarIntento({
        actividadId,
        nivel: nivelElegido.nivel,
        ...resultado,
      })
      setIntento(respuesta)
      setEstado('resultado')
    } catch (e) {
      setError(e.mensaje ?? 'No se pudo guardar tu intento.')
      setEstado('error')
    }
  }

  function reiniciar() {
    setIntento(null)
    setNivelElegido(null)
    setEstado('seleccion')
  }

  const Juego = actividad ? obtenerJuego(actividad.nombre) : null

  return (
    <div style={{ minHeight: '100%', background: 'var(--cp-bg-child)' }}>
      <BarraSuperior />
      <main
        style={{
          padding: 'clamp(14px, 2vw, 24px) clamp(12px, 2vw, 28px) 40px',
          maxWidth: 1600,
          margin: '0 auto',
        }}
      >
        {estado === 'cargando' && <PantallaCargando mensaje="Cargando actividad…" />}
        {estado === 'enviando' && <PantallaCargando mensaje="Guardando tu intento…" />}

        {estado === 'error' && (
          <EstadoVacio
            icono={Frown}
            titulo="Algo salió mal"
            mensaje={error}
            accion={
              <button
                type="button"
                onClick={() => navegar(RUTAS.nino)}
                style={botonSecundario}
              >
                Volver al inicio
              </button>
            }
          />
        )}

        {estado === 'seleccion' && actividad && (
          <div style={{ maxWidth: 940, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(92px, 9vw, 120px)',
                  height: 'clamp(92px, 9vw, 120px)',
                  borderRadius: 'var(--r-2xl)',
                  background: `color-mix(in srgb, ${color} 14%, white)`,
                  marginBottom: 14,
                }}
                aria-hidden="true"
              >
                <IconoActividad nombre={actividad.icono} size={64} color={color} strokeWidth={1.6} />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(26px, 3vw, 38px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--cp-text-1)',
                }}
              >
                {actividad.nombre}
              </h1>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', color: 'var(--cp-text-2)', marginTop: 6 }}>
                {actividad.descripcion}
              </p>
            </div>

            <p
              style={{
                fontSize: 'clamp(15px, 1.5vw, 18px)',
                fontWeight: 700,
                color: 'var(--cp-text-2)',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Elige la dificultad
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(210px, 100%), 1fr))',
                gap: 14,
              }}
            >
              {niveles.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => elegirNivel(n)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: 'clamp(22px, 2.6vh, 30px) clamp(22px, 2vw, 28px)',
                    minHeight: 'clamp(170px, 22vh, 220px)',
                    background: 'var(--cp-surface)',
                    border: '1px solid var(--cp-border)',
                    borderRadius: 'var(--r-lg)',
                    cursor: 'pointer',
                    fontFamily: 'var(--cp-font)',
                    textAlign: 'left',
                    boxShadow: 'var(--sh-sm)',
                  }}
                >
                  <span style={{ fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 700, color: 'var(--cp-text-1)' }}>
                    {ETIQUETA_NIVEL[n.nivel] ?? n.nivel}
                  </span>
                  <span style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', color: 'var(--cp-text-2)' }}>
                    {DESCRIPCION_NIVEL[n.nivel] ?? ''}
                  </span>
                  {/* El dato de ítems y tiempo se ancla abajo para aprovechar el alto de la tarjeta. */}
                  <span
                    style={{
                      marginTop: 'auto',
                      fontSize: 'clamp(13px, 1.3vw, 16px)',
                      fontWeight: 600,
                      color: 'var(--cp-text-3)',
                    }}
                  >
                    {n.configuracion.items} ítems · {n.configuracion.tiempoLimiteSegundos}s
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => navegar(RUTAS.nino)}
                style={{ ...botonSecundario, marginTop: 22, minWidth: 200 }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}

        {estado === 'jugando' && actividad && nivelElegido && Juego && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--cp-text-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <IconoActividad nombre={actividad.icono} size={17} color={color} />
                {actividad.nombre} · {ETIQUETA_NIVEL[nivelElegido.nivel] ?? nivelElegido.nivel}
              </span>
              <button
                type="button"
                onClick={reiniciar}
                style={{
                  padding: '8px 16px',
                  background: 'var(--cp-surface)',
                  color: 'var(--cp-text-2)',
                  border: '1px solid var(--cp-border)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--cp-font)',
                  cursor: 'pointer',
                }}
              >
                Salir
              </button>
            </div>

            {/* Escenario: el juego ocupa un área amplia y protagonista. */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '76vh',
                padding: 'clamp(18px, 3.5vw, 40px)',
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
                borderRadius: 'var(--r-2xl)',
                boxShadow: 'var(--sh-md)',
              }}
            >
              <Juego
                configuracion={nivelElegido.configuracion}
                nivel={nivelElegido.nivel}
                color={color}
                onTerminar={alTerminarJuego}
              />
            </div>
          </div>
        )}

        {estado === 'resultado' && intento && (
          <PantallaResultado
            intento={intento}
            color={color}
            onReintentar={reiniciar}
            onSalir={() => navegar(RUTAS.nino)}
          />
        )}
      </main>
    </div>
  )
}

const botonSecundario = {
  marginTop: 6,
  padding: '12px 22px',
  background: 'var(--cp-surface)',
  color: 'var(--cp-text-1)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}
