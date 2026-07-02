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

// Reproductor de actividades: carga la actividad, deja elegir nivel, monta el
// juego correspondiente y, al terminar, registra el intento y muestra el
// resultado con la decisión del motor adaptativo.
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
      <main style={{ padding: '24px 20px 36px', maxWidth: 600, margin: '0 auto' }}>
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
          <div>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }} aria-hidden="true">
                <IconoActividad nombre={actividad.icono} size={48} color={color} strokeWidth={1.6} />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cp-text-1)' }}>
                {actividad.nombre}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--cp-text-2)', marginTop: 4 }}>
                {actividad.descripcion}
              </p>
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--cp-text-2)', marginBottom: 10 }}>
              Elige la dificultad
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {niveles.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => elegirNivel(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--cp-surface)',
                    border: `1px solid var(--cp-border)`,
                    borderLeft: `4px solid ${color}`,
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    fontFamily: 'var(--cp-font)',
                    textAlign: 'left',
                    boxShadow: 'var(--sh-sm)',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--cp-text-1)' }}>
                    {ETIQUETA_NIVEL[n.nivel] ?? n.nivel}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--cp-text-2)' }}>
                    {n.configuracion.items} ítems · {n.configuracion.tiempoLimiteSegundos}s
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navegar(RUTAS.nino)}
              style={{ ...botonSecundario, width: '100%', marginTop: 18 }}
            >
              Volver al inicio
            </button>
          </div>
        )}

        {estado === 'jugando' && actividad && nivelElegido && Juego && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--cp-text-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <IconoActividad nombre={actividad.icono} size={15} />
                {actividad.nombre}
              </span>
              <button
                type="button"
                onClick={reiniciar}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  color: 'var(--cp-text-2)',
                  border: '1px solid var(--cp-border)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--cp-font)',
                  cursor: 'pointer',
                }}
              >
                Salir
              </button>
            </div>
            <Juego
              configuracion={nivelElegido.configuracion}
              nivel={nivelElegido.nivel}
              color={color}
              onTerminar={alTerminarJuego}
            />
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
  padding: '10px 18px',
  background: 'var(--cp-surface-2)',
  color: 'var(--cp-text-1)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}
