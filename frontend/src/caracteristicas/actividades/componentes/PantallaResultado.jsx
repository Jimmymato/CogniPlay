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
        gap: 16,
        padding: '12px 4px',
      }}
    >
      <IconoMensaje size={56} color={color} strokeWidth={1.6} aria-hidden="true" />
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--cp-text-1)', marginBottom: 4 }}>
          {mensaje.titulo}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--cp-text-2)' }}>{mensaje.texto}</p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          maxWidth: 320,
          padding: 18,
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {precision}%
          </span>
          <InsigniaPrecision precision={intento.precision} etiqueta="" />
        </div>
        <div style={{ fontSize: 12, color: 'var(--cp-text-3)' }}>
          {intento.puntaje} puntos · nivel {intento.nivel}
        </div>

        <div style={{ width: '100%', borderTop: '1px solid var(--cp-border)', marginTop: 4 }} />

        {filas.map((f) => (
          <div
            key={f.etiqueta}
            style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 13 }}
          >
            <span style={{ color: 'var(--cp-text-2)' }}>{f.etiqueta}</span>
            <span style={{ fontWeight: 700, color: f.color }}>{f.valor}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320 }}>
        <button
          type="button"
          onClick={onReintentar}
          style={{
            flex: 1,
            padding: '11px 16px',
            background: color,
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
            fontWeight: 600,
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
            padding: '11px 16px',
            background: 'var(--cp-surface-2)',
            color: 'var(--cp-text-1)',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
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
