import InsigniaPrecision from '../../../componentes/InsigniaPrecision'
import { mensajeDecision } from '../juegos/textoDecision'

// Pantalla final tras registrar un intento: muestra el desempeño y el mensaje
// alentador derivado de la decisión del motor adaptativo.
export default function PantallaResultado({ intento, color, onReintentar, onSalir }) {
  const decision = intento?.progresion?.decision?.decision
  const mensaje = mensajeDecision(decision)
  const IconoMensaje = mensaje.icono
  const precision = Math.round(Number(intento.precision))

  const filas = [
    { etiqueta: 'Aciertos', valor: intento.respuestasCorrectas, color: 'var(--cp-green-text)' },
    { etiqueta: 'Errores', valor: intento.respuestasIncorrectas, color: 'var(--cp-red-text)' },
    { etiqueta: 'Sin responder', valor: intento.omisiones, color: 'var(--cp-text-2)' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 18,
        padding: 'clamp(24px, 5vw, 48px) 16px',
        maxWidth: 560,
        margin: '0 auto',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 104,
          height: 104,
          borderRadius: '50%',
          background: `color-mix(in srgb, ${color} 12%, white)`,
        }}
      >
        <IconoMensaje size={56} color={color} strokeWidth={1.6} />
      </div>
      <div>
        <h2
          style={{
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--cp-text-1)',
            marginBottom: 6,
          }}
        >
          {mensaje.titulo}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--cp-text-2)' }}>{mensaje.texto}</p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          maxWidth: 380,
          padding: 'clamp(18px, 3vw, 26px)',
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontSize: 'clamp(42px, 8vw, 54px)',
              fontWeight: 700,
              color,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {precision}%
          </span>
          <InsigniaPrecision precision={intento.precision} etiqueta="" />
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--cp-text-3)' }}>
          {intento.puntaje} puntos · nivel {intento.nivel}
        </div>

        <div style={{ width: '100%', borderTop: '1px solid var(--cp-border)', marginTop: 4 }} />

        {filas.map((f) => (
          <div
            key={f.etiqueta}
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 14.5 }}
          >
            <span style={{ color: 'var(--cp-text-2)' }}>{f.etiqueta}</span>
            <span style={{ fontWeight: 700, color: f.color }}>{f.valor}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 380 }}>
        <button
          type="button"
          onClick={onReintentar}
          style={{
            flex: 1,
            minHeight: 52,
            padding: '12px 16px',
            background: color,
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r-md)',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--cp-font)',
            cursor: 'pointer',
          }}
        >
          Jugar otra vez
        </button>
        <button
          type="button"
          onClick={onSalir}
          style={{
            flex: 1,
            minHeight: 52,
            padding: '12px 16px',
            background: 'var(--cp-surface)',
            color: 'var(--cp-text-1)',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--r-md)',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'var(--cp-font)',
            cursor: 'pointer',
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
