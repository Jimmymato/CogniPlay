import { Timer } from 'lucide-react'

// Cabecera compartida de los juegos: muestra el progreso (ítem actual / total)
// y una barra de tiempo que se vacía y cambia de color al quedar poco.
export default function CabeceraJuego({
  titulo,
  color,
  indice,
  total,
  segundosRestantes,
  segundosTotales,
}) {
  const proporcion = segundosTotales > 0 ? segundosRestantes / segundosTotales : 1
  const colorTiempo =
    proporcion > 0.5 ? color : proporcion > 0.25 ? 'var(--cp-amber)' : 'var(--cp-red)'

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cp-text-1)' }}>
          {titulo}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cp-text-2)' }}>
          Ítem {Math.min(indice + 1, total)} de {total}
        </span>
      </div>

      {/* Progreso de ítems */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={indice}
        style={{
          height: 6,
          background: 'var(--cp-border)',
          borderRadius: 'var(--r-pill)',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(indice / total) * 100}%`,
            background: color,
            borderRadius: 'var(--r-pill)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* Tiempo restante */}
      {segundosTotales > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Timer size={14} color="var(--cp-text-2)" aria-hidden="true" style={{ flexShrink: 0 }} />
          <div
            style={{
              flex: 1,
              height: 8,
              background: 'var(--cp-surface-2)',
              borderRadius: 'var(--r-pill)',
              overflow: 'hidden',
              border: '1px solid var(--cp-border)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.max(0, proporcion) * 100}%`,
                background: colorTiempo,
                transition: 'width 0.9s linear, background 0.3s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: colorTiempo,
              fontFamily: 'var(--cp-font-mono)',
              minWidth: 28,
              textAlign: 'right',
            }}
          >
            {segundosRestantes}s
          </span>
        </div>
      )}
    </div>
  )
}
