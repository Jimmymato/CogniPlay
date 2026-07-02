import { FolderOpen } from 'lucide-react'
import EstadoVacio from '../../../componentes/EstadoVacio'
import { ETIQUETA_NIVEL, etiquetaDecision, formatearFechaHora } from './etiquetas'
import { tarjeta, tituloSeccion, pildora } from './estilos'

// Historial de cambios de dificultad y demás decisiones del motor adaptativo,
// incluidas las manuales del terapeuta (automatica: false). En las manuales la
// precisión evaluada es un 0 de relleno y no se muestra.
export default function HistorialDecisiones({ decisiones }) {
  return (
    <section style={tarjeta} aria-label="Historial de decisiones">
      <h2 style={tituloSeccion}>Historial de decisiones</h2>

      {decisiones.length === 0 ? (
        <EstadoVacio
          icono={FolderOpen}
          titulo="Sin decisiones"
          mensaje="El motor adaptativo aún no registra decisiones para este niño."
        />
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {decisiones.map((decision) => (
            <li
              key={decision.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                padding: '10px 0',
                borderTop: '1px solid var(--cp-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--cp-text-1)' }}>
                  {etiquetaDecision(decision.decision)}
                </span>
                <span
                  style={
                    decision.automatica
                      ? pildora('var(--cp-text-2)', 'var(--cp-surface-2)', 'var(--cp-border)')
                      : pildora(
                          'var(--cp-amber-text)',
                          'var(--cp-warm-light)',
                          'var(--cp-amber-border)',
                        )
                  }
                >
                  {decision.automatica ? 'Automática' : 'Manual'}
                </span>
                {decision.nivelAnterior && decision.nivelNuevo && (
                  <span style={{ fontSize: 12, color: 'var(--cp-text-2)' }}>
                    {ETIQUETA_NIVEL[decision.nivelAnterior] ?? decision.nivelAnterior} →{' '}
                    {ETIQUETA_NIVEL[decision.nivelNuevo] ?? decision.nivelNuevo}
                  </span>
                )}
                {decision.automatica && (
                  <span style={{ fontSize: 12, color: 'var(--cp-text-2)' }}>
                    precisión {Math.round(Number(decision.precisionEvaluada))}%
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cp-text-3)' }}>
                {decision.actividad?.nombre} · {formatearFechaHora(decision.creadoEn)}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--cp-text-2)', margin: 0 }}>
                {decision.razon}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
