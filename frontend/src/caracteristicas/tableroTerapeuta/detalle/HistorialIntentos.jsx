import { useEffect, useState } from 'react'
import { Frown, SearchX, Check, X, Minus } from 'lucide-react'
import InsigniaPrecision from '../../../componentes/InsigniaPrecision'
import EstadoVacio from '../../../componentes/EstadoVacio'
import IconoActividad from '../../../componentes/IconoActividad'
import { obtenerIntentosNino } from '../../../servicios/intentos.servicio'
import { ETIQUETA_NIVEL, formatearFechaHora } from './etiquetas'
import { tarjeta, tituloSeccion, estiloEntrada, botonSecundario } from './estilos'

const PAGINA = 15

// El backend espera instantes ISO: los límites del día se construyen en hora
// local del navegador para que "hasta" sea inclusivo y sin ambigüedad UTC.
function construirFiltros(actividadId, desde, hasta) {
  return {
    actividadId: actividadId || undefined,
    desde: desde ? new Date(`${desde}T00:00:00`).toISOString() : undefined,
    hasta: hasta ? new Date(`${hasta}T23:59:59.999`).toISOString() : undefined,
  }
}

// Historial de intentos con filtros por actividad y rango de fechas.
// Hace su propio fetch: los filtros se resuelven en el servidor.
export default function HistorialIntentos({ ninoId, actividades }) {
  const [actividadId, setActividadId] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [intentos, setIntentos] = useState([])
  const [visibles, setVisibles] = useState(PAGINA)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)
    obtenerIntentosNino(ninoId, construirFiltros(actividadId, desde, hasta))
      .then((datos) => {
        if (!activo) return
        setIntentos(datos)
        setVisibles(PAGINA)
      })
      .catch((err) => {
        if (activo) setError(err.mensaje ?? 'No se pudieron cargar los intentos.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [ninoId, actividadId, desde, hasta])

  return (
    <section style={tarjeta} aria-label="Historial de intentos">
      <h2 style={tituloSeccion}>Historial de intentos</h2>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <select
          value={actividadId}
          onChange={(e) => setActividadId(e.target.value)}
          aria-label="Filtrar por actividad"
          style={{ ...estiloEntrada, flex: 1, minWidth: 150 }}
        >
          <option value="">Todas las actividades</option>
          {actividades.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          aria-label="Desde"
          style={estiloEntrada}
        />
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          aria-label="Hasta"
          style={estiloEntrada}
        />
      </div>

      {cargando && (
        <p style={{ fontSize: 13, color: 'var(--cp-text-3)' }}>Cargando intentos…</p>
      )}
      {!cargando && error && <EstadoVacio icono={Frown} titulo="Algo salió mal" mensaje={error} />}
      {!cargando && !error && intentos.length === 0 && (
        <EstadoVacio
          icono={SearchX}
          titulo="Sin intentos"
          mensaje="Ningún intento coincide con los filtros."
        />
      )}

      {!cargando && !error && intentos.length > 0 && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--cp-text-2)' }}>
                  <th style={celdaCabecera}>Fecha</th>
                  <th style={celdaCabecera}>Actividad</th>
                  <th style={celdaCabecera}>Nivel</th>
                  <th style={celdaCabecera} aria-label="Aciertos, errores y omisiones">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Check size={12} color="var(--cp-green-text)" aria-hidden="true" />
                      /
                      <X size={12} color="var(--cp-red-text)" aria-hidden="true" />
                      /
                      <Minus size={12} color="var(--cp-text-2)" aria-hidden="true" />
                    </span>
                  </th>
                  <th style={celdaCabecera}>Precisión</th>
                  <th style={celdaCabecera}>Puntaje</th>
                  <th style={celdaCabecera}>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {intentos.slice(0, visibles).map((intento) => (
                  <tr key={intento.id} style={{ borderTop: '1px solid var(--cp-border)' }}>
                    <td style={{ ...celda, whiteSpace: 'nowrap', color: 'var(--cp-text-2)' }}>
                      {formatearFechaHora(intento.creadoEn)}
                    </td>
                    <td style={{ ...celda, fontWeight: 600, color: 'var(--cp-text-1)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <IconoActividad
                          nombre={intento.actividad?.icono}
                          size={14}
                          color={intento.actividad?.funcionEjecutiva?.color ?? 'currentColor'}
                        />
                        {intento.actividad?.nombre}
                      </span>
                    </td>
                    <td style={celda}>{ETIQUETA_NIVEL[intento.nivel] ?? intento.nivel}</td>
                    <td style={{ ...celda, whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--cp-green-text)', fontWeight: 700 }}>
                        {intento.respuestasCorrectas}
                      </span>
                      {' / '}
                      <span style={{ color: 'var(--cp-red-text)', fontWeight: 700 }}>
                        {intento.respuestasIncorrectas}
                      </span>
                      {' / '}
                      <span style={{ color: 'var(--cp-text-2)', fontWeight: 700 }}>
                        {intento.omisiones}
                      </span>
                    </td>
                    <td style={celda}>
                      <InsigniaPrecision precision={Number(intento.precision)} etiqueta="" />
                    </td>
                    <td style={{ ...celda, fontWeight: 600 }}>{intento.puntaje}</td>
                    <td style={{ ...celda, color: 'var(--cp-text-2)' }}>
                      {intento.tiempoSegundos}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {intentos.length > visibles && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setVisibles((v) => v + PAGINA)}
                style={botonSecundario}
              >
                Ver más ({intentos.length - visibles} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

const celdaCabecera = {
  padding: '8px 10px',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
}

const celda = { padding: '8px 10px' }
