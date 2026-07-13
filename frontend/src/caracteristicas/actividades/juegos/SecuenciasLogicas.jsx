import { useMemo, useState } from 'react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { useJuegoRondas } from './useJuegoRondas'
import { entero, barajar } from './aleatorio'
import {
  estiloJuegoRaiz,
  estiloZonaJuego,
  estiloInstruccion,
  estiloPista,
  estiloOpcion,
} from './estilosJuego'

// Crea una ronda: una secuencia aritmética visible con el último término oculto
// y cuatro opciones (la correcta y tres distractores cercanos).
function crearRonda() {
  const inicio = entero(1, 9)
  const paso = entero(1, 5)
  const visibles = [0, 1, 2, 3].map((i) => inicio + paso * i)
  const respuesta = inicio + paso * 4

  const opciones = new Set([respuesta])
  while (opciones.size < 4) {
    const desvio = entero(-3, 3)
    const candidato = respuesta + (desvio === 0 ? paso + 1 : desvio)
    if (candidato > 0) opciones.add(candidato)
  }

  return { visibles, respuesta, paso, opciones: barajar([...opciones]) }
}

export default function SecuenciasLogicas({ configuracion, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion
  const rondas = useMemo(() => Array.from({ length: items }, crearRonda), [items])
  const [elegida, setElegida] = useState(null)

  const { indice, restante, bloqueado, registrar } = useJuegoRondas({
    items,
    tiempoLimiteSegundos,
    onTerminar,
  })

  const ronda = rondas[indice]

  function responder(opcion) {
    if (bloqueado) return
    setElegida(opcion)
    registrar(opcion === ronda.respuesta, () => setElegida(null))
  }

  function estadoOpcion(opcion) {
    if (elegida === null) return null
    if (opcion === ronda.respuesta) return 'correcta'
    if (opcion === elegida) return 'incorrecta'
    return null
  }

  const celda = {
    minWidth: 'clamp(54px, 8vw, 68px)',
    height: 'clamp(54px, 8vw, 68px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(22px, 3.4vw, 28px)',
    fontWeight: 700,
    borderRadius: 'var(--r-md)',
  }

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Secuencias Lógicas"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <div style={estiloZonaJuego}>
        <p style={estiloInstruccion}>¿Qué número sigue en la secuencia?</p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 1.5vw, 14px)',
            marginBottom: 10,
          }}
        >
          {ronda.visibles.map((n, i) => (
            <span
              key={i}
              style={{
                ...celda,
                color: 'var(--cp-text-1)',
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
              }}
            >
              {n}
            </span>
          ))}
          <span
            style={{
              ...celda,
              color,
              background: `color-mix(in srgb, ${color} 12%, white)`,
              border: `2px dashed ${color}`,
            }}
          >
            ?
          </span>
        </div>

        {pistas && (
          <p style={estiloPista}>
            Pista: cada número aumenta de {ronda.paso} en {ronda.paso}.
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            marginTop: 10,
            width: '100%',
            maxWidth: 460,
            marginInline: 'auto',
          }}
        >
          {ronda.opciones.map((opcion) => (
            <button
              key={opcion}
              type="button"
              onClick={() => responder(opcion)}
              disabled={bloqueado}
              style={estiloOpcion(estadoOpcion(opcion), bloqueado, {
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--cp-text-1)',
              })}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
