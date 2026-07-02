import { useEffect, useRef, useState } from 'react'
import { Target, Hourglass, Smile } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { entero } from './aleatorio'

// Juego de estimación temporal: se pide al niño contar mentalmente cierta
// cantidad de segundos y tocar cuando crea que han pasado. No se muestra ningún
// reloj. Acierta si su estimación cae dentro de la tolerancia (±35 %, mínimo 1s).
export default function CuentaElTiempo({ configuracion, color, onTerminar }) {
  const { items, pistas } = configuracion
  const objetivos = useRef(Array.from({ length: items }, () => entero(2, 5)))

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState('espera') // 'espera' | 'feedback'
  const [info, setInfo] = useState(null) // { transcurrido, objetivo, estado }

  const aciertosRef = useRef(0)
  const erroresRef = useRef(0)
  const finalizadoRef = useRef(false)
  const montadoRef = useRef(true)
  const inicioJuegoRef = useRef(Date.now())
  const inicioItemRef = useRef(Date.now())
  const maxTimerRef = useRef(null)

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
      tiempoSegundos: Math.round((Date.now() - inicioJuegoRef.current) / 1000),
    })
  }

  function resolver(estado, datos) {
    if (estado === 'acierto') aciertosRef.current += 1
    else if (estado === 'error') erroresRef.current += 1
    setInfo({ ...datos, estado })
    setFase('feedback')
    setTimeout(() => {
      if (!montadoRef.current) return
      setInfo(null)
      if (indice + 1 >= items) {
        finalizar()
      } else {
        setFase('espera')
        setIndice((i) => i + 1)
      }
    }, 1200)
  }

  // Cada ítem reinicia el cronómetro interno y programa una omisión si tarda demasiado.
  useEffect(() => {
    if (finalizadoRef.current) return undefined
    inicioItemRef.current = Date.now()
    const objetivo = objetivos.current[indice]
    maxTimerRef.current = setTimeout(
      () => resolver('omision', { transcurrido: null, objetivo }),
      (objetivo * 2 + 2) * 1000,
    )
    return () => clearTimeout(maxTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice])

  function tocar() {
    if (fase !== 'espera') return
    clearTimeout(maxTimerRef.current)
    const objetivo = objetivos.current[indice]
    const transcurrido = (Date.now() - inicioItemRef.current) / 1000
    const tolerancia = Math.max(1, objetivo * 0.35)
    const acierto = Math.abs(transcurrido - objetivo) <= tolerancia
    resolver(acierto ? 'acierto' : 'error', {
      transcurrido: Math.round(transcurrido * 10) / 10,
      objetivo,
    })
  }

  const objetivo = objetivos.current[indice]
  const enFeedback = fase === 'feedback'

  return (
    <div>
      <CabeceraJuego
        titulo="Cuenta el Tiempo"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={0}
        segundosTotales={0}
      />

      {!enFeedback && (
        <>
          <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--cp-text-2)', marginBottom: 4 }}>
            Cuenta en tu mente
          </p>
          <p style={{ textAlign: 'center', fontSize: 40, fontWeight: 700, color, marginBottom: 6 }}>
            {objetivo} segundos
          </p>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--cp-text-3)', marginBottom: 18 }}>
            y toca el botón cuando creas que ya pasaron.
            {pistas && ' Pista: cuenta "mil uno, mil dos…".'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={tocar}
              style={{
                width: 170,
                height: 170,
                borderRadius: '50%',
                border: 'none',
                background: color,
                color: 'white',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'var(--cp-font)',
                cursor: 'pointer',
                boxShadow: 'var(--sh-md)',
              }}
            >
              ¡Ya pasó!
            </button>
          </div>
        </>
      )}

      {enFeedback && info && (
        <div style={{ textAlign: 'center', padding: '24px 12px' }}>
          <div
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}
            aria-hidden="true"
          >
            {info.estado === 'acierto' ? (
              <Target size={48} color="var(--cp-green)" strokeWidth={1.6} />
            ) : info.estado === 'omision' ? (
              <Hourglass size={48} color="var(--cp-amber)" strokeWidth={1.6} />
            ) : (
              <Smile size={48} color="var(--cp-text-2)" strokeWidth={1.6} />
            )}
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--cp-text-1)', marginBottom: 4 }}>
            {info.estado === 'acierto'
              ? '¡Muy buen cálculo!'
              : info.estado === 'omision'
                ? 'Se acabó el tiempo'
                : 'Casi…'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--cp-text-2)' }}>
            {info.transcurrido !== null
              ? `Tocaste a los ${info.transcurrido}s (objetivo: ${info.objetivo}s).`
              : `El objetivo era ${info.objetivo}s.`}
          </p>
        </div>
      )}
    </div>
  )
}
