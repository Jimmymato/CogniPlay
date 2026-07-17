import { useEffect, useRef, useState } from 'react'
import { Check, X, Hand, Hourglass } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { estiloJuegoRaiz, estiloZonaJuego, estiloInstruccion, estiloPista } from './estilosJuego'

const VERDE = '#22A867'
const ROJO = '#E04040'
// El botón de tocar es azul neutro a propósito: no debe confundirse con las
// señales verde (tocar) y roja (esperar).
const AZUL_BOTON = 'var(--cp-blue)'

// Duración de la ventana de respuesta según la dificultad elegida.
const VENTANA_MS = { FACIL: 2600, MEDIO: 2000, DIFICIL: 1500 }
const PREPARACION_MS = 850
const FEEDBACK_MS = 800

// Juego de inhibición (go / no-go). Cada ensayo tiene tres momentos bien
// separados: preparación (círculo gris, "Atento…"), señal (círculo verde =
// tocar, octágono rojo = esperar) y retroalimentación. El niño responde
// siempre con el mismo botón grande, que es independiente del estímulo.
//  - verde tocado    → acierto
//  - verde sin tocar → omisión
//  - rojo tocado     → error (no se contuvo)
//  - rojo sin tocar  → acierto (se contuvo)
export default function EsperaLaSenal({ configuracion, nivel, color, onTerminar }) {
  const { items, pistas } = configuracion
  const ventanaMs = VENTANA_MS[nivel] ?? VENTANA_MS.MEDIO

  // Secuencia fija de ensayos para toda la partida (~65 % "toca", 35 % "espera").
  const tipos = useRef(Array.from({ length: items }, () => (Math.random() < 0.65 ? 'go' : 'nogo')))

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState('preparacion') // 'preparacion' | 'senal' | 'feedback'
  const [resultado, setResultado] = useState(null) // 'acierto' | 'error' | 'omision'

  const aciertosRef = useRef(0)
  const erroresRef = useRef(0)
  const respondidoRef = useRef(false)
  const finalizadoRef = useRef(false)
  const montadoRef = useRef(true)
  const inicioRef = useRef(Date.now())
  const ventanaRef = useRef(null)

  // El cuerpo vuelve a marcar "montado" porque StrictMode monta, desmonta y
  // remonta el componente en desarrollo; solo limpiar dejaría el ref en false.
  useEffect(() => {
    montadoRef.current = true
    return () => { montadoRef.current = false }
  }, [])

  function finalizar() {
    if (finalizadoRef.current) return
    finalizadoRef.current = true
    const a = aciertosRef.current
    const e = erroresRef.current
    onTerminar({
      respuestasCorrectas: a,
      respuestasIncorrectas: e,
      omisiones: items - a - e,
      tiempoSegundos: Math.round((Date.now() - inicioRef.current) / 1000),
    })
  }

  function resolver(estado) {
    if (estado === 'acierto') aciertosRef.current += 1
    else if (estado === 'error') erroresRef.current += 1
    // 'omision' no incrementa: se deduce al finalizar.
    setResultado(estado)
    setFase('feedback')
    setTimeout(() => {
      if (!montadoRef.current) return
      setResultado(null)
      if (indice + 1 >= items) {
        finalizar()
      } else {
        setFase('preparacion')
        setIndice((i) => i + 1)
      }
    }, FEEDBACK_MS)
  }

  // Momento de preparación: pausa neutral antes de mostrar cada señal.
  useEffect(() => {
    if (finalizadoRef.current || fase !== 'preparacion') return undefined
    const id = setTimeout(() => {
      if (montadoRef.current) setFase('senal')
    }, PREPARACION_MS)
    return () => clearTimeout(id)
  }, [fase, indice])

  // Ventana de respuesta: si el niño no responde, el ensayo se resuelve solo.
  useEffect(() => {
    if (finalizadoRef.current || fase !== 'senal') return undefined
    respondidoRef.current = false
    const tipo = tipos.current[indice]
    ventanaRef.current = setTimeout(() => {
      if (respondidoRef.current) return
      respondidoRef.current = true
      resolver(tipo === 'go' ? 'omision' : 'acierto')
    }, ventanaMs)
    return () => clearTimeout(ventanaRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, indice])

  function tocar() {
    if (fase !== 'senal' || respondidoRef.current) return
    respondidoRef.current = true
    clearTimeout(ventanaRef.current)
    resolver(tipos.current[indice] === 'go' ? 'acierto' : 'error')
  }

  const tipo = tipos.current[indice]
  const botonActivo = fase === 'senal'

  const MENSAJE_FEEDBACK = {
    acierto: { icono: Check, color: VERDE, texto: '¡Muy bien!' },
    error: { icono: X, color: ROJO, texto: 'Era roja: había que esperar.' },
    omision: { icono: Hourglass, color: 'var(--cp-amber)', texto: 'Era verde: había que tocar.' },
  }

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Espera la Señal"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={0}
        segundosTotales={0}
      />

      <div style={estiloZonaJuego}>
        <p style={estiloInstruccion}>
          Toca el botón <strong>solo</strong> cuando la señal sea{' '}
          <strong style={{ color: VERDE }}>verde</strong>. Si es{' '}
          <strong style={{ color: ROJO }}>roja</strong>, ¡quédate quieto!
        </p>

        {/* Zona del estímulo, con altura fija para que nada salte de lugar. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'clamp(200px, 32vh, 300px)',
            marginBottom: 20,
          }}
          aria-live="polite"
        >
          {fase === 'preparacion' && (
            <div
              style={{
                width: 'clamp(150px, 20vw, 200px)',
                height: 'clamp(150px, 20vw, 200px)',
                borderRadius: '50%',
                background: 'var(--cp-surface-2)',
                border: '3px dashed var(--cp-border-mid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--cp-text-3)',
                fontFamily: 'var(--cp-font)',
              }}
            >
              Atento…
            </div>
          )}

          {fase === 'senal' && tipo === 'go' && (
            <div
              style={{
                width: 'clamp(160px, 22vw, 220px)',
                height: 'clamp(160px, 22vw, 220px)',
                borderRadius: '50%',
                background: VERDE,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: 'white',
                boxShadow: 'var(--sh-md)',
              }}
            >
              <Check size={72} strokeWidth={3} aria-hidden="true" />
              <span style={{ fontSize: 20, fontWeight: 700 }}>¡Verde!</span>
            </div>
          )}

          {fase === 'senal' && tipo === 'nogo' && (
            <div
              style={{
                width: 'clamp(165px, 22vw, 225px)',
                height: 'clamp(165px, 22vw, 225px)',
                background: ROJO,
                clipPath:
                  'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                color: 'white',
              }}
            >
              <Hand size={64} strokeWidth={2.2} aria-hidden="true" />
              <span style={{ fontSize: 20, fontWeight: 700 }}>¡Alto!</span>
            </div>
          )}

          {fase === 'feedback' && resultado && (() => {
            const m = MENSAJE_FEEDBACK[resultado]
            const Icono = m.icono
            return (
              <div style={{ textAlign: 'center' }}>
                <Icono size={72} strokeWidth={2.4} color={m.color} aria-hidden="true" />
                <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--cp-text-1)', marginTop: 6 }}>
                  {m.texto}
                </p>
              </div>
            )
          })()}
        </div>

        {/* Botón de respuesta fijo, independiente del estímulo. */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <button
            type="button"
            onClick={tocar}
            disabled={!botonActivo}
            aria-label="Tocar"
            style={{
              minWidth: 'min(320px, 80%)',
              minHeight: 80,
              borderRadius: 'var(--r-pill)',
              border: 'none',
              background: AZUL_BOTON,
              color: 'white',
              fontSize: 24,
              fontWeight: 700,
              fontFamily: 'var(--cp-font)',
              cursor: botonActivo ? 'pointer' : 'default',
              opacity: botonActivo ? 1 : 0.5,
              boxShadow: 'var(--sh-md)',
              transition: 'opacity 0.15s ease',
            }}
          >
            ¡TOCAR!
          </button>
        </div>

        {pistas && (
          <p style={estiloPista}>
            Círculo verde = tocar rápido · Señal roja de alto = no tocar
          </p>
        )}
      </div>
    </div>
  )
}
