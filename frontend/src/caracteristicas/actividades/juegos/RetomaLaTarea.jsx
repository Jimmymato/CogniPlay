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
  Hand,
} from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { entero, barajar } from './aleatorio'

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

// Juego de "branching": el niño ve una tarea (una secuencia con la posición en la
// que va), sufre una breve interrupción y luego debe recordar cuál seguía. Cada
// ítem tiene tres fases: ver → interrupción → responder.
function crearRondas(items) {
  return Array.from({ length: items }, () => {
    const secuencia = barajar(ICONOS).slice(0, 4)
    const posicion = entero(0, 2) // siempre queda un "siguiente"
    return { secuencia, posicion, siguiente: secuencia[posicion + 1] }
  })
}

export default function RetomaLaTarea({ configuracion, color, onTerminar }) {
  const { items } = configuracion
  const rondas = useMemo(() => crearRondas(items), [items])

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState('ver') // 'ver' | 'interrupcion' | 'responder'
  const [elegido, setElegido] = useState(null)

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
      width: 56,
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      background: 'var(--cp-surface)',
      border: '1px solid var(--cp-border)',
      borderRadius: 'var(--r-md)',
      ...extra,
    }
  }

  return (
    <div>
      <CabeceraJuego
        titulo="Retoma la Tarea"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={0}
        segundosTotales={0}
      />

      {/* Fase 1: ver la posición actual */}
      {fase === 'ver' && (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontSize: 14,
              color: 'var(--cp-text-2)',
              marginBottom: 14,
            }}
          >
            Mira bien: vas por aquí
            <ArrowDown size={15} aria-hidden="true" />
            ¿cuál sigue?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            {ronda.secuencia.map((icono, i) => (
              <div
                key={i}
                style={estiloCelda(
                  i === ronda.posicion
                    ? { border: `2px solid ${color}`, background: `color-mix(in srgb, ${color} 12%, white)` }
                    : {},
                )}
              >
                <icono.Icono size={28} color={icono.color} aria-hidden="true" />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFase('interrupcion')} style={botonPrincipal(color)}>
            Continuar
          </button>
        </div>
      )}

      {/* Fase 2: interrupción breve */}
      {fase === 'interrupcion' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }} aria-hidden="true">
            <Hand size={44} color="var(--cp-warm)" strokeWidth={1.6} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--cp-text-1)', marginBottom: 4 }}>
            ¡Una pausa!
          </p>
          <p style={{ fontSize: 13, color: 'var(--cp-text-2)', marginBottom: 18 }}>
            Recuerda en qué ibas… y vuelve cuando estés listo.
          </p>
          <button type="button" onClick={() => setFase('responder')} style={botonPrincipal(color)}>
            Volver a la tarea
          </button>
        </div>
      )}

      {/* Fase 3: responder cuál seguía */}
      {fase === 'responder' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--cp-text-2)', marginBottom: 16 }}>
            ¿Cuál seguía en tu tarea?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {ronda.secuencia.map((icono, i) => {
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
                    border: `1.5px solid ${borde}`,
                    background: fondo,
                    cursor: elegido !== null ? 'default' : 'pointer',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  })}
                >
                  <icono.Icono size={28} color={icono.color} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function botonPrincipal(color) {
  return {
    padding: '11px 22px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: 'var(--r-md)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--cp-font)',
    cursor: 'pointer',
  }
}
