import { Lock } from 'lucide-react'
import IconoActividad from '../../../componentes/IconoActividad'
import { ETIQUETA_NIVEL } from './etiquetas'
import { tarjeta, tituloSeccion, botonFila, pildora } from './estilos'

// Progreso por actividad con controles manuales. Hace merge del catálogo con
// las filas de ProgresoActividad: una actividad nunca jugada no tiene fila,
// pero igual debe poder ajustarse o bloquearse (el backend hace upsert).
export default function SeccionProgresoActividades({
  funciones,
  progreso,
  onCambiarNivel,
  onCambiarBloqueo,
}) {
  const progresoPorActividad = new Map(progreso.map((p) => [p.actividadId, p]))

  return (
    <section style={tarjeta} aria-label="Progreso por actividad">
      <h2 style={tituloSeccion}>Funciones y actividades</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {funciones.map((funcion) =>
          (funcion.actividades ?? []).map((actividad) => {
            const fila = progresoPorActividad.get(actividad.id)
            const bloqueada = fila?.bloqueadaManualmente ?? false
            return (
              <div
                key={actividad.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  padding: '10px 0',
                  borderTop: '1px solid var(--cp-border)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: funcion.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: 'var(--cp-text-1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <IconoActividad
                      nombre={actividad.icono}
                      size={15}
                      color={funcion.color}
                    />
                    {actividad.nombre}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--cp-text-3)' }}>
                    {funcion.etiqueta}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span
                    style={pildora('var(--cp-text-2)', 'var(--cp-surface-2)', 'var(--cp-border)')}
                  >
                    {fila ? ETIQUETA_NIVEL[fila.nivelActual] ?? fila.nivelActual : 'Sin iniciar'}
                  </span>
                  {fila?.nivelSuperado && (
                    <span
                      style={pildora(
                        'var(--cp-green-text)',
                        'var(--cp-green-bg)',
                        'var(--cp-green-border)',
                      )}
                    >
                      Superada
                    </span>
                  )}
                  {bloqueada && (
                    <span
                      style={{
                        ...pildora(
                          'var(--cp-red-text)',
                          'var(--cp-red-bg)',
                          'var(--cp-red-border)',
                        ),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Lock size={11} aria-hidden="true" />
                      Bloqueada
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => onCambiarNivel(actividad, fila)}
                    style={botonFila}
                  >
                    Cambiar nivel
                  </button>
                  <button
                    type="button"
                    onClick={() => onCambiarBloqueo(actividad, fila)}
                    style={botonFila}
                  >
                    {bloqueada ? 'Desbloquear' : 'Bloquear'}
                  </button>
                </div>
              </div>
            )
          }),
        )}
      </div>
    </section>
  )
}
