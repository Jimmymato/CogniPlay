import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import Figura from '../componentes/Figura'
import { useJuegoRondas } from './useJuegoRondas'
import { barajar, elementoAleatorio, elegirDistinto } from './aleatorio'
import {
  estiloJuegoRaiz,
  estiloZonaJuego,
  estiloInstruccion,
  estiloPista,
  estiloOpcion,
} from './estilosJuego'

const FORMAS = ['circulo', 'cuadrado', 'triangulo']
// Colores de estímulo apagados (público TEA), pero bien distinguibles entre sí;
// solo se comparan por identidad, nunca se nombran al niño.
const COLORES = ['#C05A52', '#2F72CE', '#3E9668', '#D49A14']

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
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Cambia la Regla"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <div style={estiloZonaJuego}>
        {/* Aviso de cambio con altura reservada para que nada salte de lugar. */}
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 'clamp(14.5px, 1.5vw, 18px)',
            fontWeight: 700,
            color: 'var(--cp-warm)',
            marginBottom: 8,
            minHeight: 24,
            visibility: ronda.cambio ? 'visible' : 'hidden',
          }}
        >
          <RefreshCw size={20} aria-hidden="true" />
          ¡Cambió la regla!
        </p>

        <p style={estiloInstruccion}>
          Elige la figura que tenga <strong>{textoRegla}</strong>.
        </p>

        {/* Estímulo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div
            style={{
              padding: 'clamp(14px, 2.5vw, 22px)',
              background: 'var(--cp-surface)',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <Figura forma={ronda.forma} color={ronda.color} tam="clamp(96px, 12vw, 180px)" />
          </div>
        </div>

        {pistas && (
          <p style={estiloPista}>
            Pista: ahora importa {ronda.regla === 'color' ? 'el color' : 'la forma'}.
          </p>
        )}

        {/* Opciones */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(14px, 1.6vw, 22px)',
            width: '100%',
            maxWidth: 720,
            marginInline: 'auto',
          }}
        >
          {ronda.opciones.map((op) => (
            <button
              key={op.clave}
              type="button"
              onClick={() => responder(op.clave)}
              disabled={bloqueado}
              aria-label={`Figura por ${op.clave}`}
              style={estiloOpcion(estadoOpcion(op.clave), bloqueado, {
                display: 'flex',
                justifyContent: 'center',
                padding: 18,
              })}
            >
              <Figura forma={op.forma} color={op.color} tam="clamp(72px, 9vw, 140px)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
