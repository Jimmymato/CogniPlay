import { Dumbbell, Flag } from 'lucide-react'
import { tarjeta, tituloSeccion } from '../tableroTerapeuta/detalle/estilos'

// Áreas con mejor desempeño y áreas que requieren refuerzo en el periodo,
// según la clasificación que entrega el backend del reporte.
export default function AreasDestacadas({ areasFuertes, areasRefuerzo }) {
  return (
    <section style={tarjeta} aria-label="Áreas destacadas del periodo">
      <h2 style={tituloSeccion}>Áreas destacadas del periodo</h2>

      <Grupo
        icono={Dumbbell}
        colorIcono="var(--cp-green-text)"
        titulo="Mejor desempeño"
        areas={areasFuertes}
        vacio="Ninguna función alcanzó todavía un promedio alto en el periodo."
      />
      <Grupo
        icono={Flag}
        colorIcono="var(--cp-amber-text)"
        titulo="Requieren refuerzo"
        areas={areasRefuerzo}
        vacio="Ninguna función requiere refuerzo en el periodo."
      />
    </section>
  )
}

function Grupo({ icono: Icono, colorIcono, titulo, areas, vacio }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--cp-text-2)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icono size={13} color={colorIcono} aria-hidden="true" />
        {titulo}
      </h3>
      {areas.length === 0 ? (
        <p style={{ fontSize: 12.5, color: 'var(--cp-text-3)' }}>{vacio}</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {areas.map((area) => (
            <span
              key={area.funcionEjecutivaId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 11px',
                borderRadius: 'var(--r-pill)',
                border: '1px solid var(--cp-border)',
                background: 'var(--cp-surface-2)',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--cp-text-1)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: area.color,
                  flexShrink: 0,
                }}
              />
              {area.etiqueta}
              <span style={{ fontWeight: 700, color: 'var(--cp-text-2)' }}>
                {Math.round(area.precisionPromedio)}%
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
