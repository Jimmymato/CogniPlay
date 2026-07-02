import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Medal,
  Flag,
  PartyPopper,
  Baby,
  SearchX,
  Frown,
} from 'lucide-react'
import DisenoTerapeuta from '../../componentes/DisenoTerapeuta'
import PantallaCargando from '../../componentes/PantallaCargando'
import EstadoVacio from '../../componentes/EstadoVacio'
import TarjetaMetrica from '../../componentes/TarjetaMetrica'
import ModalRegistrarNino from './ModalRegistrarNino'
import useMediaQuery, { CONSULTA_ESCRITORIO } from '../../hooks/useMediaQuery'
import { useAuth } from '../autenticacion/ContextoAuth'
import { obtenerNinos, cambiarEstadoNino } from '../../servicios/ninos.servicio'
import { obtenerRefuerzos } from '../../servicios/refuerzos.servicio'
import { obtenerProgresoNino } from '../../servicios/progreso.servicio'
import { rutaDetalleNino } from '../../app/enrutador/rutas'

// Calcula la edad en años a partir de la fecha de nacimiento.
function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento)
  if (Number.isNaN(nacimiento.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1
  return edad
}

// Suma las actividades con nivel superado de todos los niños. El backend solo
// expone el progreso por niño, así que la métrica se agrega en el cliente.
async function contarActividadesCompletadas(ninos) {
  const conteos = await Promise.all(
    ninos.map((nino) =>
      obtenerProgresoNino(nino.id)
        .then((progreso) => progreso.filter((p) => p.nivelSuperado).length)
        .catch(() => 0),
    ),
  )
  return conteos.reduce((total, n) => total + n, 0)
}

// Saludo según la hora del día.
function saludoPorHora() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// Fecha de hoy en formato largo, con la inicial en mayúscula.
function fechaLarga() {
  const texto = new Date().toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Panel principal del terapeuta: métricas generales, alertas de refuerzo y la
// tabla de niños con buscador, filtros y gestión (alta y activar/desactivar).
// En escritorio la tabla y las alertas conviven en dos columnas.
export default function PanelTerapeuta() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const esEscritorio = useMediaQuery(CONSULTA_ESCRITORIO)
  const nombre = usuario?.perfil?.nombres ?? ''

  const [ninos, setNinos] = useState([])
  const [refuerzos, setRefuerzos] = useState([])
  const [completadas, setCompletadas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [actualizandoId, setActualizandoId] = useState(null)

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError(null)

    // Los niños son indispensables; los refuerzos y las métricas agregadas son
    // complementarios, por eso su fallo no impide ver el panel.
    Promise.all([
      obtenerNinos(),
      obtenerRefuerzos({ estado: 'PENDIENTE' }).catch(() => []),
    ])
      .then(async ([ninosObtenidos, refuerzosObtenidos]) => {
        if (!activo) return
        setNinos(ninosObtenidos)
        setRefuerzos(refuerzosObtenidos)
        const total = await contarActividadesCompletadas(ninosObtenidos)
        if (activo) setCompletadas(total)
      })
      .catch((err) => {
        if (activo) setError(err.mensaje ?? 'No se pudieron cargar los niños.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const activos = useMemo(() => ninos.filter((n) => n.activo).length, [ninos])

  // Niños distintos que tienen al menos un refuerzo pendiente.
  const ninosEnRefuerzo = useMemo(
    () => new Set(refuerzos.map((r) => r.nino?.id)).size,
    [refuerzos],
  )

  // Aplica buscador (nombre o correo) y filtro por estado.
  const ninosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return ninos.filter((nino) => {
      if (filtroEstado === 'activos' && !nino.activo) return false
      if (filtroEstado === 'inactivos' && nino.activo) return false
      if (!texto) return true
      const nombreCompleto = `${nino.nombres} ${nino.apellidos}`.toLowerCase()
      return nombreCompleto.includes(texto) || nino.correo.toLowerCase().includes(texto)
    })
  }, [ninos, busqueda, filtroEstado])

  function alRegistrar(nino) {
    setNinos((previo) => [nino, ...previo])
    setMostrarModal(false)
  }

  async function alternarEstado(nino) {
    setActualizandoId(nino.id)
    try {
      const actualizado = await cambiarEstadoNino(nino.id, !nino.activo)
      setNinos((previo) => previo.map((n) => (n.id === nino.id ? actualizado : n)))
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo cambiar el estado del niño.')
    } finally {
      setActualizandoId(null)
    }
  }

  const inactivos = ninos.length - activos

  const buscadorYTabla = (
    <>
      {/* Buscador y filtro */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Buscar por nombre o correo…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar niños"
          style={{ ...estiloEntrada, flex: 1, minWidth: 200 }}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
          style={estiloEntrada}
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      {/* Tabla de niños */}
      {ninos.length === 0 ? (
        <EstadoVacio
          icono={Baby}
          titulo="Aún no tienes niños"
          mensaje="Registra a tu primer niño para empezar a hacer seguimiento."
        />
      ) : ninosFiltrados.length === 0 ? (
        <EstadoVacio
          icono={SearchX}
          titulo="Sin resultados"
          mensaje="Ningún niño coincide con la búsqueda o el filtro."
        />
      ) : (
        <div
          style={{
            overflowX: 'auto',
            background: 'var(--cp-surface)',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--cp-text-2)' }}>
                <th style={estiloCeldaCabecera}>Niño</th>
                <th style={estiloCeldaCabecera}>Correo</th>
                <th style={estiloCeldaCabecera}>Edad</th>
                <th style={estiloCeldaCabecera}>Estado</th>
                <th style={{ ...estiloCeldaCabecera, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ninosFiltrados.map((nino) => {
                const edad = calcularEdad(nino.fechaNacimiento)
                return (
                  <tr key={nino.id} style={{ borderTop: '1px solid var(--cp-border)' }}>
                    <td style={{ ...estiloCelda, fontWeight: 600, color: 'var(--cp-text-1)' }}>
                      {nino.nombres} {nino.apellidos}
                    </td>
                    <td style={{ ...estiloCelda, color: 'var(--cp-text-2)' }}>{nino.correo}</td>
                    <td style={estiloCelda}>{edad != null ? `${edad} años` : '—'}</td>
                    <td style={estiloCelda}>
                      <EtiquetaEstado activo={nino.activo} />
                    </td>
                    <td style={{ ...estiloCelda, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => navegar(rutaDetalleNino(nino.id))}
                        style={estiloEnlace}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        onClick={() => alternarEstado(nino)}
                        disabled={actualizandoId === nino.id}
                        style={{ ...estiloBotonFila, marginLeft: 8 }}
                      >
                        {actualizandoId === nino.id
                          ? '…'
                          : nino.activo
                            ? 'Desactivar'
                            : 'Activar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  const tarjetaRefuerzos = (
    <TarjetaRefuerzos
      refuerzos={refuerzos}
      onVerNino={(ninoId) => navegar(rutaDetalleNino(ninoId))}
    />
  )

  return (
    <DisenoTerapeuta
      titulo={`${saludoPorHora()}, ${nombre}`}
      subtitulo={`${fechaLarga()} · Panel de seguimiento`}
      acciones={
        <button type="button" onClick={() => setMostrarModal(true)} style={estiloBotonPrimario}>
          + Registrar niño
        </button>
      }
    >
      {cargando && <PantallaCargando mensaje="Cargando el panel…" />}

      {!cargando && error && <EstadoVacio icono={Frown} titulo="Algo salió mal" mensaje={error} />}

      {!cargando && !error && (
        <>
          {/* Métricas generales */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: esEscritorio
                ? 'repeat(4, minmax(0, 1fr))'
                : 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 14,
              marginBottom: 20,
            }}
          >
            <TarjetaMetrica
              icono={Users}
              valor={ninos.length}
              etiqueta="Niños en total"
              detalle={inactivos > 0 ? `${inactivos} sin acceso` : 'Todos con acceso'}
              fondo="var(--cp-blue-light)"
              colorIcono="var(--cp-blue-dark)"
            />
            <TarjetaMetrica
              icono={UserCheck}
              valor={activos}
              etiqueta="Niños activos"
              detalle="Pueden iniciar sesión"
              fondo="var(--cp-green-bg)"
              colorIcono="var(--cp-green-text)"
            />
            <TarjetaMetrica
              icono={Medal}
              valor={completadas}
              etiqueta="Actividades completadas"
              detalle="Niveles superados en total"
              fondo="var(--cp-purple-light)"
              colorIcono="var(--cp-purple-dark)"
            />
            <TarjetaMetrica
              icono={Flag}
              valor={ninosEnRefuerzo}
              etiqueta="Niños en refuerzo"
              detalle={`${refuerzos.length} refuerzos pendientes`}
              fondo="var(--cp-warm-light)"
              colorIcono="var(--cp-amber-text)"
            />
          </section>

          {esEscritorio ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 320px',
                gap: 16,
                alignItems: 'start',
              }}
            >
              <div style={{ minWidth: 0 }}>{buscadorYTabla}</div>
              {tarjetaRefuerzos}
            </div>
          ) : (
            <>
              {refuerzos.length > 0 && <div style={{ marginBottom: 20 }}>{tarjetaRefuerzos}</div>}
              {buscadorYTabla}
            </>
          )}
        </>
      )}

      {mostrarModal && (
        <ModalRegistrarNino onCerrar={() => setMostrarModal(false)} onCreado={alRegistrar} />
      )}
    </DisenoTerapeuta>
  )
}

// Tarjeta de alertas: los refuerzos pendientes con acceso directo a cada niño.
function TarjetaRefuerzos({ refuerzos, onVerNino }) {
  return (
    <aside
      style={{
        background: 'var(--cp-surface)',
        border: '1px solid var(--cp-border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--sh-sm)',
        padding: 16,
      }}
    >
      <h2
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: 'var(--cp-text-1)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Flag size={14} color="var(--cp-amber-text)" aria-hidden="true" />
        Refuerzos pendientes
      </h2>
      {refuerzos.length === 0 ? (
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--cp-text-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <PartyPopper size={14} aria-hidden="true" />
          Ningún niño necesita refuerzo por ahora.
        </p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
          {refuerzos.map((refuerzo) => (
            <li
              key={refuerzo.id}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                background: 'var(--cp-warm-light)',
                border: '1px solid var(--cp-amber-border)',
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--cp-amber-text)' }}>
                {refuerzo.nino?.nombres} {refuerzo.nino?.apellidos}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cp-text-2)', marginTop: 1 }}>
                {refuerzo.funcionEjecutiva?.etiqueta}
                {refuerzo.actividad ? ` · ${refuerzo.actividad.nombre}` : ''}
              </div>
              {refuerzo.nino?.id && (
                <button
                  type="button"
                  onClick={() => onVerNino(refuerzo.nino.id)}
                  style={{ ...estiloEnlace, padding: '4px 0', marginTop: 2 }}
                >
                  Ver niño →
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

// Semáforo textual del estado de acceso del niño.
function EtiquetaEstado({ activo }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        borderRadius: 'var(--r-pill)',
        fontSize: 12,
        fontWeight: 600,
        color: activo ? 'var(--cp-green-text)' : 'var(--cp-text-2)',
        background: activo ? 'var(--cp-green-bg)' : 'var(--cp-surface-2)',
        border: `1px solid ${activo ? 'var(--cp-green-border)' : 'var(--cp-border)'}`,
      }}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  )
}

const estiloBotonPrimario = {
  padding: '10px 16px',
  background: 'var(--cp-blue)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
  boxShadow: '0 3px 10px rgba(74,143,231,0.25)',
}

const estiloEntrada = {
  padding: '9px 11px',
  fontSize: 14,
  fontFamily: 'var(--cp-font)',
  color: 'var(--cp-text-1)',
  background: 'var(--cp-surface)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  boxSizing: 'border-box',
}

const estiloEnlace = {
  padding: '5px 10px',
  background: 'transparent',
  color: 'var(--cp-blue-dark)',
  border: 'none',
  borderRadius: 'var(--r-sm)',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}

const estiloBotonFila = {
  padding: '5px 12px',
  background: 'var(--cp-surface-2)',
  color: 'var(--cp-text-1)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-sm)',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}

const estiloCeldaCabecera = {
  padding: '11px 14px',
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
}

const estiloCelda = { padding: '11px 14px' }
