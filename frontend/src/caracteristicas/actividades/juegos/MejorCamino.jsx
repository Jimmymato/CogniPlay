import { useMemo, useState } from 'react'
import { Star, X } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { useJuegoRondas } from './useJuegoRondas'
import { entero, barajar } from './aleatorio'

// Estrellas (gana) y cruces (pierde) dibujadas como íconos.
function FilaEstrellas({ cantidad }) {
  return Array.from({ length: cantidad }, (_, i) => (
    <Star key={i} size={17} color="var(--cp-amber)" fill="var(--cp-amber)" aria-hidden="true" />
  ))
}

function FilaCruces({ cantidad }) {
  return Array.from({ length: cantidad }, (_, i) => (
    <X key={i} size={15} color="var(--cp-red)" strokeWidth={3} aria-hidden="true" />
  ))
}

// Crea una ronda con tres opciones; cada una otorga puntos ("gana") y resta
// puntos ("pierde"). La mejor opción es la de mayor saldo neto. Se evita el
// empate en el máximo para que la respuesta correcta sea única.
function maximoUnico(opciones) {
  const netos = opciones.map((o) => o.neto)
  const maximo = Math.max(...netos)
  return netos.filter((n) => n === maximo).length === 1
}

function crearRonda() {
  let opciones
  do {
    opciones = [0, 1, 2].map((i) => {
      const gana = entero(2, 6)
      const pierde = entero(0, 3)
      return { id: i, gana, pierde, neto: gana - pierde }
    })
  } while (!maximoUnico(opciones))

  const mejor = opciones.reduce((a, b) => (b.neto > a.neto ? b : a))
  return { opciones: barajar(opciones), mejorId: mejor.id }
}

export default function MejorCamino({ configuracion, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion
  const rondas = useMemo(() => Array.from({ length: items }, crearRonda), [items])
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

  function estadoOpcion(id) {
    if (elegida === null) return null
    if (id === ronda.mejorId) return 'correcta'
    if (id === elegida) return 'incorrecta'
    return null
  }

  return (
    <div>
      <CabeceraJuego
        titulo="Mejor Camino"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <p
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          flexWrap: 'wrap',
          fontSize: 14,
          color: 'var(--cp-text-2)',
          marginBottom: 14,
        }}
      >
        Elige la opción que más te conviene (gana muchas
        <Star size={15} color="var(--cp-amber)" fill="var(--cp-amber)" aria-label="estrellas" />
        y pierde pocas
        <X size={14} color="var(--cp-red)" strokeWidth={3} aria-label="cruces" />
        ).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, marginInline: 'auto' }}>
        {ronda.opciones.map((op) => {
          const estado = estadoOpcion(op.id)
          const borde =
            estado === 'correcta'
              ? 'var(--cp-green-border)'
              : estado === 'incorrecta'
                ? 'var(--cp-red-border)'
                : 'var(--cp-border)'
          const fondo =
            estado === 'correcta'
              ? 'var(--cp-green-bg)'
              : estado === 'incorrecta'
                ? 'var(--cp-red-bg)'
                : 'var(--cp-surface)'
          return (
            <button
              key={op.id}
              type="button"
              onClick={() => responder(op.id)}
              disabled={bloqueado}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: fondo,
                border: `1.5px solid ${borde}`,
                borderRadius: 'var(--r-md)',
                cursor: bloqueado ? 'default' : 'pointer',
                fontFamily: 'var(--cp-font)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }} aria-hidden="true">
                <FilaEstrellas cantidad={op.gana} />
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 1 }} aria-hidden="true">
                  {op.pierde > 0 ? (
                    <FilaCruces cantidad={op.pierde} />
                  ) : (
                    <span style={{ fontSize: 16, color: 'var(--cp-text-3)' }}>—</span>
                  )}
                </span>
                {pistas && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--cp-text-2)',
                      minWidth: 34,
                      textAlign: 'right',
                    }}
                  >
                    {op.neto >= 0 ? `+${op.neto}` : op.neto}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
