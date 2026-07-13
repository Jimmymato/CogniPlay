import { useMemo, useRef, useState } from 'react'
import {
  Apple,
  Banana,
  Grape,
  Cherry,
  Carrot,
  Star,
  Moon,
  Dog,
  Cat,
  Flower2,
  ArrowDown,
} from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { entero, barajar, elementoAleatorio } from './aleatorio'
import {
  estiloJuegoRaiz,
  estiloZonaJuego,
  estiloInstruccion,
  estiloBotonPrincipal,
} from './estilosJuego'

// Estímulos del juego: objetos reconocibles dibujados como íconos, cada uno
// con un color propio para que se distingan también por color.
const ICONOS = [
  { id: 'manzana', Icono: Apple, color: '#9E4038' },
  { id: 'banana', Icono: Banana, color: '#A87A1F' },
  { id: 'uvas', Icono: Grape, color: '#8763BD' },
  { id: 'cereza', Icono: Cherry, color: '#B25580' },
  { id: 'zanahoria', Icono: Carrot, color: '#C06515' },
  { id: 'estrella', Icono: Star, color: '#D49A14' },
  { id: 'luna', Icono: Moon, color: '#5C68C4' },
  { id: 'perro', Icono: Dog, color: '#7A6A55' },
  { id: 'gato', Icono: Cat, color: '#5A6B80' },
  { id: 'flor', Icono: Flower2, color: '#3E9668' },
]

// La dificultad cambia la longitud de la secuencia a recordar, la cantidad de
// globos de la interrupción y si aparece un distractor entre las opciones.
const LONGITUD_SECUENCIA = { FACIL: 3, MEDIO: 4, DIFICIL: 5 }
const CANTIDAD_GLOBOS = { FACIL: 2, MEDIO: 3, DIFICIL: 4 }
const COLORES_GLOBO = ['#4A8FE7', '#3E9668', '#D49A14', '#B25580', '#8763BD']

// Juego de "branching": el niño ve una tarea (una secuencia con la posición en
// la que va), sufre una interrupción ACTIVA (reventar globos, que genera
// interferencia real) y luego debe recordar cuál seguía. Las opciones se
// muestran barajadas para que no se pueda responder por posición.
function crearRondas(items, nivel) {
  const longitud = LONGITUD_SECUENCIA[nivel] ?? 4
  return Array.from({ length: items }, () => {
    const secuencia = barajar(ICONOS).slice(0, longitud)
    const posicion = entero(0, longitud - 2) // siempre queda un "siguiente"
    const siguiente = secuencia[posicion + 1]

    // En Difícil se suma un objeto que NO estaba en la secuencia.
    const fueraDeSecuencia = ICONOS.filter((i) => !secuencia.includes(i))
    const opciones = barajar(
      nivel === 'DIFICIL' ? [...secuencia, elementoAleatorio(fueraDeSecuencia)] : [...secuencia],
    )

    return { secuencia, posicion, siguiente, opciones }
  })
}

export default function RetomaLaTarea({ configuracion, nivel, color, onTerminar }) {
  const { items } = configuracion
  const rondas = useMemo(() => crearRondas(items, nivel), [items, nivel])
  const totalGlobos = CANTIDAD_GLOBOS[nivel] ?? 3

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState('ver') // 'ver' | 'interrupcion' | 'responder'
  const [elegido, setElegido] = useState(null)
  const [globosReventados, setGlobosReventados] = useState([])

  const aciertosRef = useRef(0)
  const erroresRef = useRef(0)
  const finalizadoRef = useRef(false)
  const inicioRef = useRef(Date.now())

  const ronda = rondas[indice]

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

  function empezarInterrupcion() {
    setGlobosReventados([])
    setFase('interrupcion')
  }

  function reventarGlobo(posicionGlobo) {
    if (globosReventados.includes(posicionGlobo)) return
    const reventados = [...globosReventados, posicionGlobo]
    setGlobosReventados(reventados)
    if (reventados.length >= totalGlobos) {
      // Pequeña pausa para ver el último globo reventar antes de volver.
      setTimeout(() => setFase('responder'), 400)
    }
  }

  function responder(icono) {
    if (fase !== 'responder' || elegido !== null) return
    setElegido(icono)
    if (icono === ronda.siguiente) aciertosRef.current += 1
    else erroresRef.current += 1

    setTimeout(() => {
      setElegido(null)
      if (indice + 1 >= items) {
        finalizar()
      } else {
        setFase('ver')
        setIndice((i) => i + 1)
      }
    }, 800)
  }

  function estiloCelda(extra) {
    return {
      width: 'clamp(58px, 9vw, 72px)',
      height: 'clamp(58px, 9vw, 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cp-surface)',
      border: '1px solid var(--cp-border)',
      borderRadius: 'var(--r-md)',
      ...extra,
    }
  }

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Retoma la Tarea"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={0}
        segundosTotales={0}
      />

      <div style={estiloZonaJuego}>
        {/* Fase 1: ver la posición actual */}
        {fase === 'ver' && (
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                ...estiloInstruccion,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                flexWrap: 'wrap',
              }}
            >
              Mira bien: vas por aquí
              <ArrowDown size={17} aria-hidden="true" />
              Recuerda cuál sigue.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(8px, 1.5vw, 14px)',
                flexWrap: 'wrap',
                marginBottom: 26,
              }}
            >
              {ronda.secuencia.map((icono, i) => (
                <div
                  key={i}
                  style={estiloCelda(
                    i === ronda.posicion
                      ? { border: `3px solid ${color}`, background: `color-mix(in srgb, ${color} 12%, white)` }
                      : {},
                  )}
                >
                  <icono.Icono size={34} color={icono.color} aria-hidden="true" />
                </div>
              ))}
            </div>
            <button type="button" onClick={empezarInterrupcion} style={estiloBotonPrincipal(color)}>
              Continuar
            </button>
          </div>
        )}

        {/* Fase 2: interrupción activa — reventar todos los globos */}
        {fase === 'interrupcion' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--cp-text-1)', marginBottom: 4 }}>
              ¡Una pausa!
            </p>
            <p style={{ fontSize: 15, color: 'var(--cp-text-2)', marginBottom: 22 }}>
              Revienta todos los globos para poder volver a tu tarea.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'clamp(12px, 2.5vw, 24px)',
                flexWrap: 'wrap',
                minHeight: 110,
              }}
            >
              {Array.from({ length: totalGlobos }, (_, i) => {
                const reventado = globosReventados.includes(i)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => reventarGlobo(i)}
                    disabled={reventado}
                    aria-label={reventado ? 'Globo reventado' : 'Reventar globo'}
                    style={{
                      width: 74,
                      height: 86,
                      border: 'none',
                      background: 'transparent',
                      cursor: reventado ? 'default' : 'pointer',
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: 64,
                        height: 76,
                        margin: '0 auto',
                        borderRadius: '50% 50% 46% 46%',
                        background: reventado
                          ? 'var(--cp-surface-2)'
                          : COLORES_GLOBO[i % COLORES_GLOBO.length],
                        border: reventado ? '2px dashed var(--cp-border-mid)' : 'none',
                        boxShadow: reventado ? 'none' : 'var(--sh-sm)',
                        transform: reventado ? 'scale(0.62)' : 'scale(1)',
                        opacity: reventado ? 0.45 : 1,
                        transition: 'transform 0.18s ease, opacity 0.18s ease',
                      }}
                    />
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--cp-text-3)', marginTop: 12 }}>
              {globosReventados.length} de {totalGlobos}
            </p>
          </div>
        )}

        {/* Fase 3: responder cuál seguía (opciones barajadas, sin la secuencia a la vista) */}
        {fase === 'responder' && (
          <div style={{ textAlign: 'center' }}>
            <p style={estiloInstruccion}>¿Cuál seguía en tu tarea?</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(10px, 2vw, 16px)',
                flexWrap: 'wrap',
              }}
            >
              {ronda.opciones.map((icono, i) => {
                const esElegido = elegido === icono
                const esCorrecto = icono === ronda.siguiente
                const borde =
                  elegido === null
                    ? 'var(--cp-border)'
                    : esCorrecto
                      ? 'var(--cp-green-border)'
                      : esElegido
                        ? 'var(--cp-red-border)'
                        : 'var(--cp-border)'
                const fondo =
                  elegido !== null && esCorrecto
                    ? 'var(--cp-green-bg)'
                    : elegido !== null && esElegido
                      ? 'var(--cp-red-bg)'
                      : 'var(--cp-surface)'
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => responder(icono)}
                    disabled={elegido !== null}
                    aria-label={icono.id}
                    style={estiloCelda({
                      border: `2px solid ${borde}`,
                      background: fondo,
                      cursor: elegido !== null ? 'default' : 'pointer',
                      transition: 'background 0.2s ease, border-color 0.2s ease',
                    })}
                  >
                    <icono.Icono size={34} color={icono.color} aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
