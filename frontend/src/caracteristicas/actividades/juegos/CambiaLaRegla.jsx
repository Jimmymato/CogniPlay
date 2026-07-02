import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import Figura from '../componentes/Figura'
import { useJuegoRondas } from './useJuegoRondas'
import { barajar, elementoAleatorio, elegirDistinto } from './aleatorio'

const FORMAS = ['circulo', 'cuadrado', 'triangulo']
const COLORES = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B']

// Genera las rondas. La "regla" (clasificar por color o por forma) cambia de vez
// en cuando para exigir flexibilidad. Cada ronda ofrece dos opciones: una que
// coincide por color y otra que coincide por forma.
function crearRondas(items) {
  const rondas = []
  let regla = Math.random() < 0.5 ? 'color' : 'forma'
  let reglaPrevia = null

  for (let i = 0; i < items; i++) {
    if (i > 0 && Math.random() < 0.45) {
      regla = regla === 'color' ? 'forma' : 'color'
    }
    const forma = elementoAleatorio(FORMAS)
    const color = elementoAleatorio(COLORES)

    const opciones = barajar([
      { clave: 'color', forma: elegirDistinto(FORMAS, forma), color }, // mismo color
      { clave: 'forma', forma, color: elegirDistinto(COLORES, color) }, // misma forma
    ])

    rondas.push({ forma, color, regla, opciones, cambio: reglaPrevia !== null && reglaPrevia !== regla })
    reglaPrevia = regla
  }
  return rondas
}

export default function CambiaLaRegla({ configuracion, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion
  const rondas = useMemo(() => crearRondas(items), [items])
  const [elegida, setElegida] = useState(null)

  const { indice, restante, bloqueado, registrar } = useJuegoRondas({
    items,
    tiempoLimiteSegundos,
    onTerminar,
  })

  const ronda = rondas[indice]
  const textoRegla = ronda.regla === 'color' ? 'el mismo COLOR' : 'la misma FORMA'

  function responder(clave) {
    if (bloqueado) return
    setElegida(clave)
    registrar(clave === ronda.regla, () => setElegida(null))
  }

  function estadoOpcion(clave) {
    if (elegida === null) return null
    if (clave === ronda.regla) return 'correcta'
    if (clave === elegida) return 'incorrecta'
    return null
  }

  return (
    <div>
      <CabeceraJuego
        titulo="Cambia la Regla"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      {ronda.cambio && (
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--cp-warm)',
            marginBottom: 8,
          }}
        >
          <RefreshCw size={14} aria-hidden="true" />
          ¡Cambió la regla!
        </p>
      )}

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--cp-text-2)', marginBottom: 14 }}>
        Elige la figura que tenga <strong>{textoRegla}</strong>.
      </p>

      {/* Estímulo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div
          style={{
            padding: 14,
            background: 'var(--cp-surface)',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
          <Figura forma={ronda.forma} color={ronda.color} tam={64} />
        </div>
      </div>

      {pistas && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--cp-text-3)', marginBottom: 12 }}>
          Pista: ahora importa {ronda.regla === 'color' ? 'el color' : 'la forma'}.
        </p>
      )}

      {/* Opciones */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          maxWidth: 320,
          marginInline: 'auto',
        }}
      >
        {ronda.opciones.map((op) => {
          const estado = estadoOpcion(op.clave)
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
              key={op.clave}
              type="button"
              onClick={() => responder(op.clave)}
              disabled={bloqueado}
              aria-label={`Figura por ${op.clave}`}
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 16,
                background: fondo,
                border: `1.5px solid ${borde}`,
                borderRadius: 'var(--r-md)',
                cursor: bloqueado ? 'default' : 'pointer',
                transition: 'background 0.2s ease, border-color 0.2s ease',
              }}
            >
              <Figura forma={op.forma} color={op.color} tam={52} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
