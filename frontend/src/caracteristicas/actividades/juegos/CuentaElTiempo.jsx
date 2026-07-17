import { useEffect, useRef, useState } from 'react'
import { Target, Hourglass, Smile } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { entero } from './aleatorio'
import {
  estiloJuegoRaiz,
  estiloZonaJuego,
  estiloInstruccion,
  estiloPista,
  estiloBotonPrincipal,
} from './estilosJuego'

// Segundos a contar y tolerancia (proporción del objetivo) según dificultad.
const RANGO_OBJETIVO = { FACIL: [3, 4], MEDIO: [3, 6], DIFICIL: [4, 8] }
const TOLERANCIA = { FACIL: 0.45, MEDIO: 0.35, DIFICIL: 0.25 }

// Juego de estimación temporal: el niño decide cuándo empezar a contar (botón
// "¡Empezar!"), cuenta mentalmente los segundos pedidos y toca "¡Ya pasó!"
// cuando cree que transcurrieron. No se muestra ningún reloj. Acierta si su
// estimación cae dentro de la tolerancia del nivel.
export default function CuentaElTiempo({ configuracion, nivel, color, onTerminar }) {
  const { items, pistas } = configuracion
  const [minimo, maximo] = RANGO_OBJETIVO[nivel] ?? RANGO_OBJETIVO.MEDIO
  const tolerancia = TOLERANCIA[nivel] ?? TOLERANCIA.MEDIO

  const objetivos = useRef(Array.from({ length: items }, () => entero(minimo, maximo)))

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState('listo') // 'listo' | 'contando' | 'feedback'
  const [info, setInfo] = useState(null) // { transcurrido, objetivo, estado }

  const aciertosRef = useRef(0)
  const erroresRef = useRef(0)
  const finalizadoRef = useRef(false)
  const montadoRef = useRef(true)
  const inicioJuegoRef = useRef(Date.now())
  const inicioItemRef = useRef(Date.now())
  const maxTimerRef = useRef(null)

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
        setFase('listo')
        setIndice((i) => i + 1)
      }
    }, 1800)
  }

  // El conteo empieza cuando el niño lo decide; desde ahí corre el cronómetro
  // interno y una omisión programada por si tarda demasiado.
  function empezar() {
    if (fase !== 'listo') return
    inicioItemRef.current = Date.now()
    const objetivo = objetivos.current[indice]
    maxTimerRef.current = setTimeout(
      () => {
        if (montadoRef.current) resolver('omision', { transcurrido: null, objetivo })
      },
      (objetivo * 2 + 3) * 1000,
    )
    setFase('contando')
  }

  useEffect(() => () => clearTimeout(maxTimerRef.current), [])

  function yaPaso() {
    if (fase !== 'contando') return
    clearTimeout(maxTimerRef.current)
    const objetivo = objetivos.current[indice]
    const transcurrido = (Date.now() - inicioItemRef.current) / 1000
    const margen = Math.max(1, objetivo * tolerancia)
    const acierto = Math.abs(transcurrido - objetivo) <= margen
    resolver(acierto ? 'acierto' : 'error', {
      transcurrido: Math.round(transcurrido * 10) / 10,
      objetivo,
      margen,
    })
  }

  const objetivo = objetivos.current[indice]

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Cuenta el Tiempo"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={0}
        segundosTotales={0}
      />

      <div style={estiloZonaJuego}>
        {fase === 'listo' && (
          <div style={{ textAlign: 'center' }}>
            <p style={estiloInstruccion}>Cuando toques el botón, cuenta en tu mente</p>
            <p
              style={{
                fontSize: 'clamp(46px, 6vw, 88px)',
                fontWeight: 700,
                color,
                textAlign: 'center',
                letterSpacing: '-0.03em',
                marginBottom: 8,
              }}
            >
              {objetivo} segundos
            </p>
            <p style={{ ...estiloPista, marginBottom: 22 }}>
              y avisa cuando creas que ya pasaron.
              {pistas && ' Pista: cuenta "mil uno, mil dos…".'}
            </p>
            <button type="button" onClick={empezar} style={estiloBotonPrincipal(color, { minWidth: 220 })}>
              ¡Empezar a contar!
            </button>
          </div>
        )}

        {fase === 'contando' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 'clamp(160px, 20vw, 260px)',
                  height: 'clamp(160px, 20vw, 260px)',
                  borderRadius: '50%',
                  background: `color-mix(in srgb, ${color} 14%, white)`,
                  border: `3px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(46px, 5vw, 64px)',
                  fontWeight: 700,
                  color,
                  animation: 'cp-pulso 1.5s ease-in-out infinite',
                }}
              >
                {objetivo}s
              </div>
            </div>
            <p style={{ ...estiloInstruccion, marginBottom: 22 }}>
              Cuenta {objetivo} segundos en tu mente…
            </p>
            <button type="button" onClick={yaPaso} style={estiloBotonPrincipal(color, { minWidth: 220 })}>
              ¡Ya pasó!
            </button>
          </div>
        )}

        {fase === 'feedback' && info && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }} aria-hidden="true">
              {info.estado === 'acierto' ? (
                <Target size={80} color="var(--cp-green)" strokeWidth={1.6} />
              ) : info.estado === 'omision' ? (
                <Hourglass size={80} color="var(--cp-amber)" strokeWidth={1.6} />
              ) : (
                <Smile size={80} color="var(--cp-text-2)" strokeWidth={1.6} />
              )}
            </div>
            <p style={{ fontSize: 'clamp(19px, 2vw, 25px)', fontWeight: 700, color: 'var(--cp-text-1)', marginBottom: 6 }}>
              {info.estado === 'acierto'
                ? '¡Muy buen cálculo!'
                : info.estado === 'omision'
                  ? 'Pasó mucho tiempo'
                  : info.transcurrido < info.objetivo
                    ? 'Un poquito antes…'
                    : 'Un poquito después…'}
            </p>
            <p style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', color: 'var(--cp-text-2)', marginBottom: 16 }}>
              {info.transcurrido !== null
                ? `Tocaste a los ${info.transcurrido}s. El objetivo era ${info.objetivo}s.`
                : `El objetivo era ${info.objetivo}s.`}
            </p>

            {/* Barra de cercanía: zona verde = tolerancia, punto = su toque. */}
            {info.transcurrido !== null && (
              <div style={{ maxWidth: 460, margin: '0 auto' }}>
                <div
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    height: 14,
                    background: 'var(--cp-surface-2)',
                    border: '1px solid var(--cp-border)',
                    borderRadius: 'var(--r-pill)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${((info.objetivo - info.margen) / (info.objetivo * 2)) * 100}%`,
                      width: `${((info.margen * 2) / (info.objetivo * 2)) * 100}%`,
                      top: 0,
                      bottom: 0,
                      background: 'var(--cp-green-bg)',
                      border: '1px solid var(--cp-green-border)',
                      borderRadius: 'var(--r-pill)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: `${Math.min(98, (info.transcurrido / (info.objetivo * 2)) * 100)}%`,
                      top: -4,
                      width: 10,
                      height: 20,
                      background: info.estado === 'acierto' ? 'var(--cp-green)' : 'var(--cp-red)',
                      borderRadius: 'var(--r-pill)',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    color: 'var(--cp-text-3)',
                    marginTop: 6,
                  }}
                >
                  <span>0s</span>
                  <span>{info.objetivo}s</span>
                  <span>{info.objetivo * 2}s</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
