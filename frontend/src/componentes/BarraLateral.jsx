import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ChartColumn } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../caracteristicas/autenticacion/ContextoAuth'
import { RUTAS } from '../app/enrutador/rutas'

// Elementos de navegación del terapeuta. "Reportes" llegará con la subfase 5.7,
// por eso se muestra deshabilitado con la insignia "Pronto".
const ELEMENTOS = [
  { id: 'inicio', icono: Home, etiqueta: 'Inicio', ruta: RUTAS.terapeuta },
  { id: 'reportes', icono: ChartColumn, etiqueta: 'Reportes', proximamente: true },
]

// Barra lateral del terapeuta (solo escritorio): marca, navegación y la sesión
// del usuario con su cierre. En pantallas angostas se usa BarraSuperior.
export default function BarraLateral() {
  const { usuario, logout } = useAuth()
  const navegar = useNavigate()
  const { pathname } = useLocation()

  const nombres = usuario?.perfil?.nombres ?? ''
  const apellidos = usuario?.perfil?.apellidos ?? ''
  const iniciales = `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || '?'

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'var(--cp-surface)',
        borderRight: '1px solid var(--cp-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--cp-border)' }}>
        <Logo size={28} />
      </div>

      <span
        style={{
          padding: '16px 20px 6px',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--cp-text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
        }}
      >
        Principal
      </span>

      <nav style={{ padding: '0 10px', flex: 1 }}>
        {ELEMENTOS.map((elemento) => {
          const activo = elemento.ruta === pathname
          return (
            <button
              key={elemento.id}
              type="button"
              disabled={elemento.proximamente}
              onClick={() => elemento.ruta && navegar(elemento.ruta)}
              aria-current={activo ? 'page' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                marginBottom: 2,
                border: 'none',
                borderRadius: 'var(--r-md)',
                background: activo ? 'var(--cp-blue-light)' : 'transparent',
                color: activo ? 'var(--cp-blue-dark)' : 'var(--cp-text-2)',
                fontFamily: 'var(--cp-font)',
                fontSize: 13.5,
                fontWeight: activo ? 600 : 500,
                cursor: elemento.proximamente ? 'default' : 'pointer',
                opacity: elemento.proximamente ? 0.55 : 1,
                textAlign: 'left',
              }}
            >
              <elemento.icono size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{elemento.etiqueta}</span>
              {elemento.proximamente && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--cp-text-3)',
                    background: 'var(--cp-surface-2)',
                    border: '1px solid var(--cp-border)',
                    borderRadius: 'var(--r-pill)',
                    padding: '2px 7px',
                  }}
                >
                  Pronto
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--cp-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--cp-purple)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12.5,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {iniciales}
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--cp-text-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {nombres} {apellidos}
            </div>
            <div style={{ fontSize: 11, color: 'var(--cp-text-3)' }}>Terapeuta</div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--cp-surface-2)',
            color: 'var(--cp-text-1)',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--cp-font)',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
