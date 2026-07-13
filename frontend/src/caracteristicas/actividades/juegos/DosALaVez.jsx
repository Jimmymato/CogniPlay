import { useMemo, useState } from 'react'
import { Star, Heart, Dog, Cat, Apple, Sun, Fish, Flower2 } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { useJuegoRondas } from './useJuegoRondas'
import { barajar, elementoAleatorio } from './aleatorio'
import {
  estiloJuegoRaiz,
  estiloZonaJuego,
  estiloInstruccion,
  estiloPista,
  estiloOpcion,
} from './estilosJuego'

// Objetos reconocibles, cada uno con color propio para distinguirse bien.
const ICONOS = [
  { id: 'estrella', Icono: Star, color: '#D49A14', relleno: true },
  { id: 'corazon', Icono: Heart, color: '#C05A52', relleno: true },
  { id: 'perro', Icono: Dog, color: '#7A6A55' },
  { id: 'gato', Icono: Cat, color: '#5A6B80' },
  { id: 'manzana', Icono: Apple, color: '#9E4038' },
  { id: 'sol', Icono: Sun, color: '#C06515' },
  { id: 'pez', Icono: Fish, color: '#2F72CE' },
  { id: 'flor', Icono: Flower2, color: '#3E9668' },
]

// Cuántos objetos muestra cada ventana según la dificultad.
const OBJETOS_POR_VENTANA = { FACIL: 1, MEDIO: 2, DIFICIL: 3 }

const AZUL = 'var(--cp-blue)'
const AMBAR = 'var(--cp-amber)'

// Juego de atención dividida: hay que vigilar DOS ventanas al mismo tiempo.
// La respuesta es "Sí" solo cuando cada ventana muestra su objeto buscado
// (ambas condiciones a la vez). Los objetivos son fijos durante toda la
// partida para que la regla sea estable y concreta.
function crearContenido(objetivo, aparece, cantidad, distractores) {
  const contenido = []
  if (aparece) contenido.push(objetivo)
  const restantes = barajar(distractores).slice(0, cantidad - contenido.length)
  return barajar([...contenido, ...restantes])
}

function crearRondas(items, nivel, objetivoIzq, objetivoDer) {
  const cantidad = OBJETOS_POR_VENTANA[nivel] ?? 2

  return Array.from({ length: items }, () => {
    // ~50 % "Sí"; el resto reparte fallos entre una ventana, la otra o ninguna.
    const azar = Math.random()
    const izqTiene = azar < 0.5 || (azar >= 0.66 && azar < 0.83)
    const derTiene = azar < 0.5 || (azar >= 0.5 && azar < 0.66)

    // En Fácil los distractores nunca son los objetos buscados; en Medio y
    // Difícil el objeto de la OTRA ventana puede aparecer como distractor
    // (hay que fijarse en qué ventana está, no solo en verlo).
    const base = ICONOS.filter((i) => i !== objetivoIzq && i !== objetivoDer)
    const distractoresIzq = nivel === 'FACIL' ? base : [...base, objetivoDer]
    const distractoresDer = nivel === 'FACIL' ? base : [...base, objetivoIzq]

    return {
      izquierda: crearContenido(objetivoIzq, izqTiene, cantidad, distractoresIzq),
      derecha: crearContenido(objetivoDer, derTiene, cantidad, distractoresDer),
      cumple: izqTiene && derTiene,
    }
  })
}

// Ícono con su color propio (y relleno cuando la silueta lo pide).
function Objeto({ objeto, tam }) {
  const { Icono, color, relleno } = objeto
  return <Icono size={tam} color={color} fill={relleno ? color : 'none'} aria-hidden="true" />
}

function Ventana({ titulo, colorMarco, contenido }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        border: `3px solid ${colorMarco}`,
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        background: 'var(--cp-surface)',
        boxShadow: 'var(--sh-sm)',
      }}
    >
      <div
        style={{
          padding: '7px 10px',
          background: `color-mix(in srgb, ${colorMarco} 14%, white)`,
          fontSize: 13.5,
          fontWeight: 700,
          color: 'var(--cp-text-1)',
          textAlign: 'center',
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          minHeight: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 14,
          flexWrap: 'wrap',
        }}
      >
        {contenido.map((objeto, i) => (
          <Objeto key={`${objeto.id}${i}`} objeto={objeto} tam={44} />
        ))}
      </div>
    </div>
  )
}

export default function DosALaVez({ configuracion, nivel, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion

  // Objetivos fijos de la partida: uno para cada ventana, siempre distintos.
  const { objetivoIzq, objetivoDer } = useMemo(() => {
    const primero = elementoAleatorio(ICONOS)
    const segundo = elementoAleatorio(ICONOS.filter((i) => i !== primero))
    return { objetivoIzq: primero, objetivoDer: segundo }
  }, [])

  const rondas = useMemo(
    () => crearRondas(items, nivel, objetivoIzq, objetivoDer),
    [items, nivel, objetivoIzq, objetivoDer],
  )
  const [elegida, setElegida] = useState(null)

  const { indice, restante, bloqueado, registrar } = useJuegoRondas({
    items,
    tiempoLimiteSegundos,
    onTerminar,
  })

  const ronda = rondas[indice]

  function responder(respuesta) {
    if (bloqueado) return
    setElegida(respuesta)
    const esCorrecto = (respuesta === 'si') === ronda.cumple
    registrar(esCorrecto, () => setElegida(null))
  }

  function estadoBoton(respuesta) {
    if (elegida === null) return null
    const correcta = ronda.cumple ? 'si' : 'no'
    if (respuesta === correcta) return 'correcta'
    if (respuesta === elegida) return 'incorrecta'
    return null
  }

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Dos a la Vez"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <div style={estiloZonaJuego}>
        <p style={{ ...estiloInstruccion, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          ¿Está
          <Objeto objeto={objetivoIzq} tam={26} />
          en la <strong>ventana azul</strong>
          <span aria-hidden="true">y</span>
          <Objeto objeto={objetivoDer} tam={26} />
          en la <strong>ventana amarilla</strong>?
        </p>

        {/* Las dos ventanas que hay que vigilar a la vez. */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 20px)',
            width: '100%',
            maxWidth: 640,
            marginInline: 'auto',
            marginBottom: 18,
          }}
        >
          <Ventana titulo="Ventana azul" colorMarco={AZUL} contenido={ronda.izquierda} />
          <Ventana titulo="Ventana amarilla" colorMarco={AMBAR} contenido={ronda.derecha} />
        </div>

        {pistas && (
          <p style={estiloPista}>
            Pista: mira las DOS ventanas antes de responder. Solo es "Sí" si están los dos.
          </p>
        )}

        {/* Sí / No */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            width: '100%',
            maxWidth: 420,
            marginInline: 'auto',
          }}
        >
          {[
            { clave: 'si', texto: 'Sí' },
            { clave: 'no', texto: 'No' },
          ].map((b) => (
            <button
              key={b.clave}
              type="button"
              onClick={() => responder(b.clave)}
              disabled={bloqueado}
              style={estiloOpcion(estadoBoton(b.clave), bloqueado, {
                fontSize: 21,
                fontWeight: 700,
                color: 'var(--cp-text-1)',
              })}
            >
              {b.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
