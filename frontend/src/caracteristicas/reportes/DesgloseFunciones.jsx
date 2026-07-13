import { tarjeta, tituloSeccion, pildora } from '../tableroTerapeuta/detalle/estilos'
import { categoriaDeFuncion } from './etiquetasReporte'

// Desglose del periodo por función ejecutiva: barra de precisión promedio con
// el color de identidad de cada función, cantidad de intentos y categoría.
// Cada barra lleva su etiqueta y su valor en texto (la identidad nunca
// depende solo del color).
export default function DesgloseFunciones({ porFuncion }) {
  return (
    <section style={tarjeta} aria-label="Desglose por función ejecutiva">
      <h2 style={tituloSeccion}>Desglose por función ejecutiva</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {porFuncion.map((funcion) => {
          const categoria = categoriaDeFuncion(funcion.categoria)
          const sinDatos = funcion.intentos === 0
          return (
            <div key={funcion.funcionEjecutivaId}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 13,
                    fontWeight: 600,
                    color: sinDatos ? 'var(--cp-text-3)' : 'var(--cp-text-1)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: funcion.color,
                      opacity: sinDatos ? 0.35 : 1,
                      flexShrink: 0,
                    }}
                  />
                  {funcion.etiqueta}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--cp-text-3)' }}>
                    {funcion.intentos} intento{funcion.intentos === 1 ? '' : 's'}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--cp-text-2)', minWidth: 42, textAlign: 'right' }}>
                    {sinDatos ? '—' : `${Math.round(funcion.precisionPromedio)}%`}
                  </span>
                  <span style={pildora(categoria.color, categoria.fondo, categoria.borde)}>
                    {categoria.texto}
                  </span>
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--cp-surface-2)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${sinDatos ? 0 : funcion.precisionPromedio}%`,
                    height: '100%',
                    borderRadius: 'var(--r-pill)',
                    background: funcion.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
