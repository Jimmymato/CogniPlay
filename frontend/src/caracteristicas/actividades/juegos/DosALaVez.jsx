import { useMemo, useState } from 'react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { useJuegoRondas } from './useJuegoRondas'
import { entero, elementoAleatorio } from './aleatorio'

const VOCALES = 'AEIOU'
const CONSONANTES = 'BCDFGHJKLMNPRSTV'

// Cada ronda exige atender DOS cosas a la vez: una letra y un número. La
// respuesta correcta es "Sí" solo cuando se cumplen ambas condiciones
// (la letra es vocal Y el número es mayor que 5).
function crearRonda() {
  const esVocal = Math.random() < 0.5
  const letra = elementoAleatorio((esVocal ? VOCALES : CONSONANTES).split(''))
  const numero = entero(1, 9)
  const cumple = esVocal && numero > 5
  return { letra, numero, cumple }
}

export default function DosALaVez({ configuracion, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion
  const rondas = useMemo(() => Array.from({ length: items }, crearRonda), [items])
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

  const panel = {
    flex: 1,
    padding: '18px 12px',
    background: 'var(--cp-surface)',
    border: '1px solid var(--cp-border)',
    borderRadius: 'var(--r-lg)',
    textAlign: 'center',
    boxShadow: 'var(--sh-sm)',
  }

  return (
    <div>
      <CabeceraJuego
        titulo="Dos a la Vez"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--cp-text-2)', marginBottom: 14 }}>
        ¿La letra es <strong>vocal</strong> <em>y</em> el número es <strong>mayor que 5</strong>?
      </p>

      {/* Dos estímulos simultáneos */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={panel}>
          <div style={{ fontSize: 11, color: 'var(--cp-text-3)', marginBottom: 6 }}>Letra</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--cp-text-1)' }}>{ronda.letra}</div>
        </div>
        <div style={panel}>
          <div style={{ fontSize: 11, color: 'var(--cp-text-3)', marginBottom: 6 }}>Número</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--cp-text-1)' }}>{ronda.numero}</div>
        </div>
      </div>

      {pistas && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cp-text-3)', marginBottom: 12 }}>
          Pista: vocales son A, E, I, O, U.
        </p>
      )}

      {/* Sí / No */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 320, marginInline: 'auto' }}>
        {[
          { clave: 'si', texto: 'Sí' },
          { clave: 'no', texto: 'No' },
        ].map((b) => {
          const estado = estadoBoton(b.clave)
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
              key={b.clave}
              type="button"
              onClick={() => responder(b.clave)}
              disabled={bloqueado}
              style={{
                padding: '14px 0',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--cp-text-1)',
                background: fondo,
                border: `1.5px solid ${borde}`,
                borderRadius: 'var(--r-md)',
                cursor: bloqueado ? 'default' : 'pointer',
                fontFamily: 'var(--cp-font)',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              {b.texto}
            </button>
          )
        })}
      </div>
    </div>
  )
}
