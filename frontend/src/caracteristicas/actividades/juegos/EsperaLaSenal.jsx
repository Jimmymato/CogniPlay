import { useEffect, useRef, useState } from 'react'
import { Check, X, Minus } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'

// Juego de inhibición (go / no-go): el niño debe tocar SOLO cuando aparece el
// círculo verde y contenerse cuando aparece el rojo. Cada ítem es un ensayo con
// una ventana de tiempo; si no responde, se resuelve solo.
//  - verde tocado  → acierto
//  - verde sin tocar → omisión
//  - rojo tocado   → error (no se contuvo)
//  - rojo sin tocar → acierto (se contuvo)
export default function EsperaLaSenal({ configuracion, color, onTerminar }) {
  const { items, pistas } = configuracion
  const ventanaMs = pistas ? 1900 : 1300

  // Secuencia fija de ensayos para toda la partida (~65 % "toca", 35 % "espera").
  const tipos = useRef(Array.from({ length: items }, () => (Math.random() < 0.65 ? 'go' : 'nogo')))

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState('senal') // 'senal' | 'feedback'
  const [resultado, setResultado] = useState(null) // 'acierto' | 'error' | 'omision'

  const aciertosRef = useRef(0)
  const erroresRef = useRef(0)
  const respondidoRef = useRef(false)
  const finalizadoRef = useRef(false)
  const montadoRef = useRef(true)
  const inicioRef = useRef(Date.now())
  const ventanaRef = useRef(null)

  useEffect(() => () => { montadoRef.current = false }, [])

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
        setFase('senal')
        setIndice((i) => i + 1)
      }
    }, 650)
  }

  // Inicia cada ensayo y programa su resolución automática al vencer la ventana.
  useEffect(() => {
    if (finalizadoRef.current) return undefined
    respondidoRef.current = false
    const tipo = tipos.current[indice]
    ventanaRef.current = setTimeout(() => {
      if (respondidoRef.current) return
      respondidoRef.current = true
      resolver(tipo === 'go' ? 'omision' : 'acierto')
    }, ventanaMs)
    return () => clearTimeout(ventanaRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice])

  function tocar() {
    if (fase !== 'senal' || respondidoRef.current) return
    respondidoRef.current = true
    clearTimeout(ventanaRef.current)
    resolver(tipos.current[indice] === 'go' ? 'acierto' : 'error')
  }

  const tipo = tipos.current[indice]
  const enFeedback = fase === 'feedback'
  const verde = '#22A867'
  const rojo = '#E04040'
  const fondoSenal = enFeedback
    ? resultado === 'error'
      ? rojo
      : verde
    : tipo === 'go'
      ? verde
      : rojo

  const contenidoSenal = enFeedback ? (
    resultado === 'acierto' ? (
      <Check size={64} strokeWidth={3} aria-hidden="true" />
    ) : resultado === 'error' ? (
      <X size={64} strokeWidth={3} aria-hidden="true" />
    ) : (
      <Minus size={64} strokeWidth={3} aria-hidden="true" />
    )
  ) : tipo === 'go' ? (
    '¡Toca!'
  ) : (
    'Espera'
  )

  return (
    <div>
      <CabeceraJuego
        titulo="Espera la Señal"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={0}
        segundosTotales={0}
      />

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--cp-text-2)', marginBottom: 18 }}>
        Toca <strong>solo</strong> cuando veas el círculo <strong style={{ color: verde }}>verde</strong>.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <button
          type="button"
          onClick={tocar}
          disabled={enFeedback}
          aria-label="Tocar la señal"
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            border: 'none',
            background: fondoSenal,
            color: 'white',
            fontSize: 22,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--cp-font)',
            cursor: enFeedback ? 'default' : 'pointer',
            boxShadow: 'var(--sh-md)',
            transition: 'background 0.2s ease',
          }}
        >
          {contenidoSenal}
        </button>
      </div>

      {pistas && !enFeedback && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cp-text-3)' }}>
          Verde = tocar · Rojo = no tocar
        </p>
      )}
    </div>
  )
}
