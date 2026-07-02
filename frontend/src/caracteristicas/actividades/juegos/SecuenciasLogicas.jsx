import { useMemo, useState } from 'react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import { useJuegoRondas } from './useJuegoRondas'
import { entero, barajar } from './aleatorio'

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

  return (
    <div>
      <CabeceraJuego
        titulo="Secuencias Lógicas"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--cp-text-2)', marginBottom: 14 }}>
        ¿Qué número sigue en la secuencia?
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 8,
        }}
      >
        {ronda.visibles.map((n, i) => (
          <span
            key={i}
            style={{
              minWidth: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--cp-text-1)',
              background: 'var(--cp-surface)',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--r-md)',
            }}
          >
            {n}
          </span>
        ))}
        <span
          style={{
            minWidth: 52,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color,
            background: `color-mix(in srgb, ${color} 12%, white)`,
            border: `2px dashed ${color}`,
            borderRadius: 'var(--r-md)',
          }}
        >
          ?
        </span>
      </div>

      {pistas && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cp-text-3)', marginBottom: 14 }}>
          Pista: cada número aumenta de {ronda.paso} en {ronda.paso}.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginTop: 8,
          maxWidth: 360,
          marginInline: 'auto',
        }}
      >
        {ronda.opciones.map((opcion) => {
          const estado = estadoOpcion(opcion)
          const fondo =
            estado === 'correcta'
              ? 'var(--cp-green-bg)'
              : estado === 'incorrecta'
                ? 'var(--cp-red-bg)'
                : 'var(--cp-surface)'
          const borde =
            estado === 'correcta'
              ? 'var(--cp-green-border)'
              : estado === 'incorrecta'
                ? 'var(--cp-red-border)'
                : 'var(--cp-border)'
          return (
            <button
              key={opcion}
              type="button"
              onClick={() => responder(opcion)}
              disabled={bloqueado}
              style={{
                padding: '16px 0',
                fontSize: 22,
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
              {opcion}
            </button>
          )
        })}
      </div>
    </div>
  )
}
