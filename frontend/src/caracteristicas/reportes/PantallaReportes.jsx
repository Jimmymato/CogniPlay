import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardList,
  Clock3,
  FileDown,
  FileSpreadsheet,
  Medal,
  Target,
  Baby,
} from 'lucide-react'
import DisenoTerapeuta from '../../componentes/DisenoTerapeuta'
import PantallaCargando from '../../componentes/PantallaCargando'
import EstadoVacio from '../../componentes/EstadoVacio'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import GraficosEvolucion from '../tableroTerapeuta/detalle/GraficosEvolucion'
import DesgloseFunciones from './DesgloseFunciones'
import AreasDestacadas from './AreasDestacadas'
import ResumenApoyo from './ResumenApoyo'
import useMediaQuery, { CONSULTA_ESCRITORIO } from '../../hooks/useMediaQuery'
import { obtenerNinos } from '../../servicios/ninos.servicio'
import {
  descargarReporte,
  obtenerHistorialReporte,
  obtenerResumenReporte,
} from '../../servicios/reportes.servicio'
import {
  botonFila,
  botonSecundario,
  estiloEntrada,
} from '../tableroTerapeuta/detalle/estilos'

// Periodos rápidos del reporte. `dias: null` cubre todo el historial.
const PERIODOS = [
  { id: '7', texto: 'Últimos 7 días', dias: 7 },
  { id: '30', texto: 'Últimos 30 días', dias: 30 },
  { id: '90', texto: 'Últimos 90 días', dias: 90 },
  { id: 'todo', texto: 'Todo el historial', dias: null },
]

// Instante ISO local del inicio del día de hace `dias - 1` días (incluye hoy).
function fechaDesdePorDias(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - (dias - 1))
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}T00:00:00`
}

// Filtros de fecha del periodo elegido (mismos que usa la consulta del reporte).
function filtrosDePeriodo(periodoId) {
  const periodo = PERIODOS.find((p) => p.id === periodoId)
  return periodo?.dias ? { desde: fechaDesdePorDias(periodo.dias) } : {}
}

// Vista de reportes del terapeuta (Subfase 5.7): selector de niño y periodo,
// resumen de actividades, gráficos de evolución, desglose por función
// ejecutiva, resumen en lenguaje de apoyo y descarga del reporte en PDF/Excel.
export default function PantallaReportes() {
  const esEscritorio = useMediaQuery(CONSULTA_ESCRITORIO)

  const [ninos, setNinos] = useState([])
  const [cargandoNinos, setCargandoNinos] = useState(true)
  const [ninoId, setNinoId] = useState('')
  const [periodoId, setPeriodoId] = useState('30')

  const [resumen, setResumen] = useState(null)
  const [historial, setHistorial] = useState([])
  const [cargandoReporte, setCargandoReporte] = useState(false)
  const [error, setError] = useState(null)
  // Formato en descarga ('pdf' | 'xlsx') o null si no hay descarga en curso.
  const [exportando, setExportando] = useState(null)

  // Carga inicial de los niños del terapeuta; por defecto el primer activo.
  useEffect(() => {
    let activo = true
    obtenerNinos()
      .then((obtenidos) => {
        if (!activo) return
        setNinos(obtenidos)
        const primero = obtenidos.find((n) => n.activo) ?? obtenidos[0]
        if (primero) setNinoId(primero.id)
      })
      .catch((err) => {
        if (activo) setError(err.mensaje ?? 'No se pudieron cargar los niños.')
      })
      .finally(() => {
        if (activo) setCargandoNinos(false)
      })
    return () => {
      activo = false
    }
  }, [])

  // Cada cambio de niño o periodo vuelve a pedir el reporte completo.
  useEffect(() => {
    if (!ninoId) return undefined
    let activo = true
    setCargandoReporte(true)
    setError(null)

    const filtros = filtrosDePeriodo(periodoId)

    Promise.all([
      obtenerResumenReporte(ninoId, filtros),
      obtenerHistorialReporte(ninoId, filtros),
    ])
      .then(([resumenObtenido, historialObtenido]) => {
        if (!activo) return
        setResumen(resumenObtenido)
        setHistorial(historialObtenido)
      })
      .catch((err) => {
        if (activo) setError(err.mensaje ?? 'No se pudo generar el reporte.')
      })
      .finally(() => {
        if (activo) setCargandoReporte(false)
      })

    return () => {
      activo = false
    }
  }, [ninoId, periodoId])

  const minutosTotales = useMemo(
    () => Math.round((resumen?.totales.tiempoTotalSegundos ?? 0) / 60),
    [resumen],
  )

  // Descarga el reporte del niño y periodo actuales en el formato pedido.
  async function manejarExportar(formato) {
    if (!ninoId || exportando) return
    setExportando(formato)
    setError(null)
    try {
      await descargarReporte(ninoId, filtrosDePeriodo(periodoId), formato)
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo descargar el reporte.')
    } finally {
      setExportando(null)
    }
  }

  if (cargandoNinos) {
    return <PantallaCargando mensaje="Cargando reportes…" />
  }

  return (
    <DisenoTerapeuta
      titulo="Reportes"
      subtitulo="Evolución del desempeño por niño y periodo"
      acciones={
        <BotonesExportar
          onExportar={manejarExportar}
          exportando={exportando}
          habilitado={Boolean(ninoId) && !cargandoReporte}
        />
      }
    >
      {ninos.length === 0 ? (
        <EstadoVacio
          icono={Baby}
          titulo="Aún no tienes niños registrados"
          mensaje="Registra un niño desde el panel para generar sus reportes."
        />
      ) : (
        <>
          {/* Filtros: niño y periodo en una sola fila. */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <label
              htmlFor="selector-nino"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--cp-text-2)' }}
            >
              Niño
            </label>
            <select
              id="selector-nino"
              value={ninoId}
              onChange={(evento) => setNinoId(evento.target.value)}
              style={{ ...estiloEntrada, minWidth: 200 }}
            >
              {ninos.map((nino) => (
                <option key={nino.id} value={nino.id}>
                  {nino.nombres} {nino.apellidos}
                  {nino.activo ? '' : ' (inactivo)'}
                </option>
              ))}
            </select>

            <div role="group" aria-label="Periodo del reporte" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PERIODOS.map((periodo) => {
                const activo = periodo.id === periodoId
                return (
                  <button
                    key={periodo.id}
                    type="button"
                    onClick={() => setPeriodoId(periodo.id)}
                    aria-pressed={activo}
                    style={{
                      ...botonFila,
                      background: activo ? 'var(--cp-blue-light)' : 'var(--cp-surface-2)',
                      color: activo ? 'var(--cp-blue-dark)' : 'var(--cp-text-1)',
                      borderColor: activo ? 'var(--cp-blue-mid)' : 'var(--cp-border)',
                    }}
                  >
                    {periodo.texto}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p
              role="alert"
              style={{
                padding: '10px 14px',
                marginBottom: 16,
                borderRadius: 'var(--r-md)',
                background: 'var(--cp-red-bg)',
                border: '1px solid var(--cp-red-border)',
                color: 'var(--cp-red-text)',
                fontSize: 13,
              }}
            >
              {error}
            </p>
          )}

          {cargandoReporte || !resumen ? (
            !error && <PantallaCargando mensaje="Generando reporte…" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Resumen de actividades realizadas en el periodo. */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: esEscritorio ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                  gap: 12,
                }}
              >
                <TarjetaMetrica
                  icono={ClipboardList}
                  valor={resumen.totales.intentos}
                  etiqueta="Intentos"
                  detalle={`${resumen.totales.actividadesJugadas} actividades jugadas`}
                />
                <TarjetaMetrica
                  icono={Target}
                  valor={`${Math.round(resumen.totales.precisionPromedio)}%`}
                  etiqueta="Precisión promedio"
                  detalle={`Puntaje promedio: ${Math.round(resumen.totales.puntajePromedio)}`}
                  fondo="var(--cp-teal-light)"
                  colorIcono="var(--cp-teal)"
                />
                <TarjetaMetrica
                  icono={Clock3}
                  valor={`${minutosTotales} min`}
                  etiqueta="Tiempo de práctica"
                  detalle={`${resumen.totales.intentosCompletados} intentos completados`}
                  fondo="var(--cp-warm-light)"
                  colorIcono="var(--cp-amber-text)"
                />
                <TarjetaMetrica
                  icono={Medal}
                  valor={resumen.totales.actividadesSuperadas}
                  etiqueta="Actividades superadas"
                  detalle={`${resumen.totales.refuerzosPendientes} refuerzos pendientes`}
                  fondo="var(--cp-purple-light)"
                  colorIcono="var(--cp-purple-dark)"
                />
              </div>

              {/* Evolución + áreas destacadas; en escritorio a dos columnas. */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: esEscritorio ? '1.6fr 1fr' : '1fr',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                <GraficosEvolucion intentos={historial} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <AreasDestacadas
                    areasFuertes={resumen.areasFuertes}
                    areasRefuerzo={resumen.areasRefuerzo}
                  />
                  <ResumenApoyo frases={resumen.resumenApoyo} />
                </div>
              </div>

              <DesgloseFunciones porFuncion={resumen.porFuncion} />
            </div>
          )}
        </>
      )}
    </DisenoTerapeuta>
  )
}

// Botones de descarga del reporte en los formatos que expone el backend.
function BotonesExportar({ onExportar, exportando, habilitado }) {
  const boton = (formato, Icono, texto) => {
    const ocupado = exportando === formato
    const deshabilitado = !habilitado || Boolean(exportando)
    return (
      <button
        type="button"
        onClick={() => onExportar(formato)}
        disabled={deshabilitado}
        aria-busy={ocupado}
        title={`Descargar el reporte en ${texto}`}
        style={{
          ...botonSecundario,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          opacity: deshabilitado ? 0.55 : 1,
          cursor: deshabilitado ? 'default' : 'pointer',
        }}
      >
        <Icono size={15} aria-hidden="true" /> {ocupado ? 'Generando…' : texto}
      </button>
    )
  }
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {boton('pdf', FileDown, 'PDF')}
      {boton('xlsx', FileSpreadsheet, 'Excel')}
    </div>
  )
}
