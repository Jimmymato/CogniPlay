import { calcularEdad, formatearFecha } from './etiquetas'
import { tarjeta, pildora } from './estilos'

// Tarjeta de identidad del niño: avatar, estado, datos básicos y porcentaje
// de avance (actividades superadas sobre el total del catálogo).
export default function TarjetaPaciente({ nino, actividadesSuperadas, totalActividades, totalIntentos }) {
  const edad = calcularEdad(nino.fechaNacimiento)
  const iniciales = `${nino.nombres[0] ?? ''}${nino.apellidos[0] ?? ''}`.toUpperCase()
  const avance =
    totalActividades > 0 ? Math.round((actividadesSuperadas / totalActividades) * 100) : 0

  return (
    <section style={tarjeta} aria-label="Datos del niño">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <span
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--cp-blue)',
            color: '#fff',
            fontSize: 19,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {iniciales}
        </span>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {nino.nombres} {nino.apellidos}
          </h2>
          <span
            style={
              nino.activo
                ? pildora('var(--cp-green-text)', 'var(--cp-green-bg)', 'var(--cp-green-border)')
                : pildora('var(--cp-text-2)', 'var(--cp-surface-2)', 'var(--cp-border)')
            }
          >
            {nino.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 14px',
          margin: 0,
          fontSize: 13,
        }}
      >
        <Dato etiqueta="Edad" valor={edad != null ? `${edad} años` : '—'} />
        <Dato etiqueta="Intentos" valor={totalIntentos} />
        <Dato etiqueta="Correo" valor={nino.correo} />
        <Dato etiqueta="Registrado" valor={formatearFecha(nino.creadoEn)} />
      </dl>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12.5,
            marginBottom: 6,
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--cp-text-2)' }}>Avance</span>
          <span style={{ fontWeight: 700, color: 'var(--cp-text-1)' }}>
            {avance}% · {actividadesSuperadas}/{totalActividades} actividades
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={avance}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Porcentaje de avance"
          style={{
            height: 8,
            borderRadius: 'var(--r-pill)',
            background: 'var(--cp-surface-2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${avance}%`,
              height: '100%',
              borderRadius: 'var(--r-pill)',
              background: 'var(--cp-purple)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </section>
  )
}

function Dato({ etiqueta, valor }) {
  return (
    <div style={{ minWidth: 0 }}>
      <dt
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--cp-text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 2,
        }}
      >
        {etiqueta}
      </dt>
      <dd
        style={{
          margin: 0,
          fontWeight: 600,
          color: 'var(--cp-text-1)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {valor}
      </dd>
    </div>
  )
}
