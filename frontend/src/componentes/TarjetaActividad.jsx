import { useState } from 'react'
import { Lock } from 'lucide-react'
import InsigniaPrecision from './InsigniaPrecision'
import IconoActividad from './IconoActividad'

// Tarjeta de una actividad que el niño puede jugar. Es un botón real para que
// funcione con teclado y lectores de pantalla; el color y la etiqueta de su
// función ejecutiva la identifican dentro de la grilla única del tablero.
// Si el terapeuta la bloqueó, se muestra con candado y no es jugable.
export default function TarjetaActividad({
  actividad,
  colorFuncion,
  etiquetaFuncion,
  ultimoIntento,
  bloqueada = false,
  onJugar,
}) {
  const [resaltada, setResaltada] = useState(false)
  const [enfocada, setEnfocada] = useState(false)

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
        gap: 14,
        width: '100%',
        textAlign: 'left',
        padding: 20,
        background: 'var(--cp-surface)',
        borderLeft: `1px solid ${enfocada && !bloqueada ? colorFuncion : 'var(--cp-border)'}`,
        borderRight: `1px solid ${enfocada && !bloqueada ? colorFuncion : 'var(--cp-border)'}`,
        borderBottom: `1px solid ${enfocada && !bloqueada ? colorFuncion : 'var(--cp-border)'}`,
        borderTop: `4px solid ${colorFuncion}`,
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
      {/* Chip de la función ejecutiva a la que pertenece la actividad. */}
      {etiquetaFuncion && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: colorFuncion,
            background: `color-mix(in srgb, ${colorFuncion} 10%, white)`,
            border: `1px solid color-mix(in srgb, ${colorFuncion} 30%, white)`,
            borderRadius: 'var(--r-pill)',
            padding: '4px 11px',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: colorFuncion,
              flexShrink: 0,
            }}
          />
          {etiquetaFuncion}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 'var(--r-md)',
            background: `color-mix(in srgb, ${colorFuncion} 14%, white)`,
            flexShrink: 0,
          }}
        >
          <IconoActividad nombre={actividad.icono} size={30} color={colorFuncion} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--cp-text-1)',
              letterSpacing: '-0.01em',
            }}
          >
            {actividad.nombre}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--cp-text-2)', marginTop: 3, lineHeight: 1.4 }}>
            {actividad.descripcion}
          </div>
        </div>
        {bloqueada ? (
          <Lock size={22} color="var(--cp-text-3)" aria-hidden="true" />
        ) : (
          ultimoIntento && <InsigniaPrecision precision={ultimoIntento.precision} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', width: '100%' }}>
        {bloqueada ? (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 13.5,
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
              fontSize: 14,
              fontWeight: 700,
              color: colorFuncion,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            Jugar
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M4 3l4 4-4 4"
                stroke={colorFuncion}
                strokeWidth="1.8"
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
