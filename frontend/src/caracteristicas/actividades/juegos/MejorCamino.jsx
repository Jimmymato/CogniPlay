import { useMemo, useState } from 'react'
import { Rabbit, Carrot, Star, TrafficCone } from 'lucide-react'
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

// Juego de toma de decisiones hecho literal: hay que llevar al conejo hasta la
// zanahoria eligiendo el mejor camino. Cada camino muestra, de forma contable
// a simple vista, las estrellas que se ganan y los conos que estorban.
//  - Fácil: 2 caminos sin conos → gana el que tiene más estrellas.
//  - Medio: 3 caminos; el mejor domina (más estrellas Y menos conos).
//  - Difícil: 3 caminos; hay que sopesar estrellas contra conos.
function crearRonda(nivel) {
  let caminos

  if (nivel === 'FACIL') {
    const mayor = entero(3, 5)
    const menor = entero(1, mayor - 1)
    caminos = [
      { estrellas: mayor, conos: 0 },
      { estrellas: menor, conos: 0 },
    ]
  } else if (nivel === 'MEDIO') {
    const mejor = { estrellas: entero(4, 5), conos: entero(0, 1) }
    caminos = [
      mejor,
      { estrellas: entero(1, mejor.estrellas - 1), conos: entero(mejor.conos + 1, 3) },
      { estrellas: entero(1, mejor.estrellas - 1), conos: entero(mejor.conos + 1, 3) },
    ]
  } else {
    // Difícil: saldo neto (estrellas − conos) con máximo único.
    do {
      caminos = [0, 1, 2].map(() => ({ estrellas: entero(1, 5), conos: entero(0, 3) }))
    } while (!maximoUnico(caminos))
  }

  const conIds = caminos.map((c, i) => ({ ...c, id: i, neto: c.estrellas - c.conos }))
  const mejor = conIds.reduce((a, b) => (b.neto > a.neto ? b : a))
  return { caminos: barajar(conIds), mejorId: mejor.id }
}

function maximoUnico(caminos) {
  const netos = caminos.map((c) => c.estrellas - c.conos)
  const maximo = Math.max(...netos)
  return netos.filter((n) => n === maximo).length === 1
}

// Tramo punteado del camino, para que las tarjetas se lean como un recorrido.
function Tramo() {
  return (
    <span
      aria-hidden="true"
      style={{ flex: 1, minWidth: 12, borderTop: '2px dashed var(--cp-border-mid)' }}
    />
  )
}

export default function MejorCamino({ configuracion, nivel, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion
  const rondas = useMemo(
    () => Array.from({ length: items }, () => crearRonda(nivel)),
    [items, nivel],
  )
  const [elegida, setElegida] = useState(null)

  const { indice, restante, bloqueado, registrar } = useJuegoRondas({
    items,
    tiempoLimiteSegundos,
    onTerminar,
  })

  const ronda = rondas[indice]

  function responder(id) {
    if (bloqueado) return
    setElegida(id)
    registrar(id === ronda.mejorId, () => setElegida(null))
  }

  function estadoCamino(id) {
    if (elegida === null) return null
    if (id === ronda.mejorId) return 'correcta'
    if (id === elegida) return 'incorrecta'
    return null
  }

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Mejor Camino"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <div style={estiloZonaJuego}>
        <p style={estiloInstruccion}>
          ¿Por cuál camino llevas al conejo hasta la zanahoria?
          <br />
          <span style={{ fontSize: 15, color: 'var(--cp-text-2)' }}>
            Gana el camino con más{' '}
            <Star
              size={16}
              color="var(--cp-amber)"
              fill="var(--cp-amber)"
              aria-label="estrellas"
              style={{ verticalAlign: -2 }}
            />{' '}
            y menos{' '}
            <TrafficCone
              size={16}
              color="#C06515"
              aria-label="conos"
              style={{ verticalAlign: -2 }}
            />
            .
          </span>
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            width: '100%',
            maxWidth: 760,
            marginInline: 'auto',
          }}
        >
          {ronda.caminos.map((camino) => {
            const estado = estadoCamino(camino.id)
            return (
              <button
                key={camino.id}
                type="button"
                onClick={() => responder(camino.id)}
                disabled={bloqueado}
                aria-label={`Camino con ${camino.estrellas} estrellas y ${camino.conos} conos`}
                style={estiloOpcion(estado, bloqueado, {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                })}
              >
                <Rabbit size={38} color="var(--cp-text-2)" aria-hidden="true" style={{ flexShrink: 0 }} />
                <Tramo />
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  {Array.from({ length: camino.estrellas }, (_, i) => (
                    <Star key={`e${i}`} size={30} color="var(--cp-amber)" fill="var(--cp-amber)" />
                  ))}
                  {Array.from({ length: camino.conos }, (_, i) => (
                    <TrafficCone key={`c${i}`} size={30} color="#C06515" />
                  ))}
                </span>
                <Tramo />
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Carrot size={38} color="#C06515" aria-hidden="true" />
                  {pistas && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--cp-text-2)',
                        minWidth: 30,
                        textAlign: 'right',
                      }}
                    >
                      {camino.neto >= 0 ? `+${camino.neto}` : camino.neto}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {pistas && (
          <p style={{ ...estiloPista, marginTop: 14 }}>
            Pista: el numerito muestra cuánto vale cada camino.
          </p>
        )}
      </div>
    </div>
  )
}
