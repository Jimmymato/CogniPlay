import { Dumbbell, Flag, Sprout } from 'lucide-react'
import { tarjeta, tituloSeccion, botonSecundario } from './estilos'

// Umbrales alineados con el motor adaptativo del backend.
const UMBRAL_FUERTE = 85
const UMBRAL_ADECUADO = 60
const INTENTOS_RECIENTES = 10

// Clasifica cada función ejecutiva según la precisión promedio de los
// intentos recientes; una función con refuerzo abierto siempre cuenta como
// "necesita refuerzo".
function clasificarFunciones(funciones, intentos, refuerzos) {
  const funcionesConRefuerzo = new Set(
    refuerzos
      .filter((r) => r.estado === 'PENDIENTE' || r.estado === 'EN_PROGRESO')
      .map((r) => r.funcionEjecutiva?.etiqueta),
  )

  return funciones.map((funcion) => {
    const recientes = intentos
      .filter((i) => i.actividad?.funcionEjecutivaId === funcion.id)
      .slice(0, INTENTOS_RECIENTES)
    const promedio =
      recientes.length > 0
        ? Math.round(
            recientes.reduce((suma, i) => suma + Number(i.precision), 0) / recientes.length,
          )
        : null

    const conRefuerzo = funcionesConRefuerzo.has(funcion.etiqueta)
    let grupo = 'sinDatos'
    if (promedio !== null || conRefuerzo) {
      if (conRefuerzo || (promedio !== null && promedio < UMBRAL_ADECUADO)) grupo = 'refuerzo'
      else if (promedio >= UMBRAL_FUERTE) grupo = 'fuerte'
      else grupo = 'desarrollo'
    }
    return { funcion, promedio, grupo, conRefuerzo }
  })
}

const COLOR_GRUPO = {
  fuerte: 'var(--cp-green)',
  desarrollo: 'var(--cp-warm)',
  refuerzo: 'var(--cp-red-text)',
}

// Áreas fortalecidas y áreas que necesitan refuerzo, con barras de precisión
// promedio por función ejecutiva (estilo PerformanceBar del diseño).
export default function AreasDesempeno({ funciones, intentos, refuerzos, onAsignarRefuerzo }) {
  const clasificadas = clasificarFunciones(funciones, intentos, refuerzos)
  const fuertes = clasificadas.filter((c) => c.grupo === 'fuerte')
  const refuerzo = clasificadas.filter((c) => c.grupo === 'refuerzo')
  const resto = clasificadas.filter((c) => c.grupo === 'desarrollo' || c.grupo === 'sinDatos')

  return (
    <section style={tarjeta} aria-label="Áreas de desempeño">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <h2 style={{ ...tituloSeccion, marginBottom: 0 }}>Áreas de desempeño</h2>
        <button type="button" onClick={onAsignarRefuerzo} style={botonSecundario}>
          + Refuerzo
        </button>
      </div>

      <Grupo
        icono={Dumbbell}
        colorIcono="var(--cp-green-text)"
        titulo="Fortalecidas"
        elementos={fuertes}
        vacio="Aún ninguna consolidada."
      />
      <Grupo
        icono={Flag}
        colorIcono="var(--cp-amber-text)"
        titulo="Necesitan refuerzo"
        elementos={refuerzo}
        vacio="Ninguna por ahora."
      />
      <Grupo
        icono={Sprout}
        colorIcono="var(--cp-teal)"
        titulo="En desarrollo"
        elementos={resto}
        vacio="Sin funciones pendientes."
      />
    </section>
  )
}

function Grupo({ icono: Icono, colorIcono, titulo, elementos, vacio }) {
  return (
    <div style={{ marginBottom: 14 }}>
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
      {elementos.length === 0 ? (
        <p style={{ fontSize: 12.5, color: 'var(--cp-text-3)' }}>{vacio}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {elementos.map(({ funcion, promedio, grupo, conRefuerzo }) => (
            <div key={funcion.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12.5,
                  marginBottom: 3,
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--cp-text-1)' }}>
                  {funcion.etiqueta}
                  {conRefuerzo && (
                    <span style={{ color: 'var(--cp-red-text)', fontWeight: 600 }}>
                      {' '}
                      · refuerzo abierto
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--cp-text-2)' }}>
                  {promedio !== null ? `${promedio}%` : 'Sin datos'}
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
                    width: `${promedio ?? 0}%`,
                    height: '100%',
                    borderRadius: 'var(--r-pill)',
                    background: COLOR_GRUPO[grupo] ?? funcion.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
