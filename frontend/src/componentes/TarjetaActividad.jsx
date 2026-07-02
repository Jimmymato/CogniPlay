import { useState } from 'react'
import { Lock } from 'lucide-react'
import InsigniaPrecision from './InsigniaPrecision'
import IconoActividad from './IconoActividad'

// Nombres legibles de los niveles de dificultad.
const ETIQUETA_NIVEL = {
  FACIL: 'Fácil',
  MEDIO: 'Medio',
  DIFICIL: 'Difícil',
}

// Tarjeta de una actividad que el niño puede jugar. Es un botón real para que
// funcione con teclado y lectores de pantalla; el color proviene de su función.
// Si el terapeuta la bloqueó, se muestra con candado y no es jugable.
export default function TarjetaActividad({
  actividad,
  colorFuncion,
  ultimoIntento,
  bloqueada = false,
  onJugar,
}) {
  const [resaltada, setResaltada] = useState(false)
  const [enfocada, setEnfocada] = useState(false)

  const niveles = [...(actividad.niveles ?? [])].sort((a, b) => {
    const orden = ['FACIL', 'MEDIO', 'DIFICIL']
    return orden.indexOf(a.nivel) - orden.indexOf(b.nivel)
  })

  return (
    <button
      type="button"
      onClick={() => !bloqueada && onJugar(actividad)}
      onMouseEnter={() => setResaltada(true)}
      onMouseLeave={() => setResaltada(false)}
      onFocus={() => setEnfocada(true)}
      onBlur={() => setEnfocada(false)}
      disabled={bloqueada}
      aria-disabled={bloqueada}
      aria-label={
        bloqueada
          ? `Actividad ${actividad.nombre} bloqueada por tu terapeuta`
          : `Jugar ${actividad.nombre}`
      }
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        padding: 16,
        background: 'var(--cp-surface)',
        border: `1px solid ${enfocada && !bloqueada ? colorFuncion : 'var(--cp-border)'}`,
        borderRadius: 'var(--r-lg)',
        boxShadow: (resaltada || enfocada) && !bloqueada ? 'var(--sh-md)' : 'var(--sh-sm)',
        outline: enfocada && !bloqueada ? `2px solid ${colorFuncion}` : 'none',
        outlineOffset: 2,
        transform: resaltada && !bloqueada ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: bloqueada ? 'not-allowed' : 'pointer',
        opacity: bloqueada ? 0.6 : 1,
        fontFamily: 'var(--cp-font)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 46,
            height: 46,
            borderRadius: 'var(--r-md)',
            background: `color-mix(in srgb, ${colorFuncion} 14%, white)`,
            flexShrink: 0,
          }}
        >
          <IconoActividad nombre={actividad.icono} size={24} color={colorFuncion} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--cp-text-1)',
              letterSpacing: '-0.01em',
            }}
          >
            {actividad.nombre}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--cp-text-2)', marginTop: 2 }}>
            {actividad.descripcion}
          </div>
        </div>
        {bloqueada ? (
          <Lock size={20} color="var(--cp-text-3)" aria-hidden="true" />
        ) : (
          ultimoIntento && <InsigniaPrecision precision={ultimoIntento.precision} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {niveles.map((n) => (
          <span
            key={n.id}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--cp-text-2)',
              background: 'var(--cp-surface-2)',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--r-pill)',
              padding: '3px 9px',
            }}
          >
            {ETIQUETA_NIVEL[n.nivel] ?? n.nivel}
          </span>
        ))}
        {bloqueada ? (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--cp-text-3)',
            }}
          >
            Bloqueada
          </span>
        ) : (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 12.5,
              fontWeight: 600,
              color: colorFuncion,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Jugar
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M4 3l4 4-4 4"
                stroke={colorFuncion}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    </button>
  )
}
