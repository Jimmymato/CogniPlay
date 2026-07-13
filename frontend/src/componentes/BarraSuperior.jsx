import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ChartColumn, Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../caracteristicas/autenticacion/ContextoAuth'
import { RUTAS } from '../app/enrutador/rutas'

// Navegación del terapeuta (la misma que en BarraLateral de escritorio).
const ELEMENTOS_TERAPEUTA = [
  { id: 'inicio', icono: Home, etiqueta: 'Inicio', ruta: RUTAS.terapeuta },
  { id: 'reportes', icono: ChartColumn, etiqueta: 'Reportes', ruta: RUTAS.reportes },
]

// Barra superior compartida: marca, nombre del usuario y cierre de sesión.
// Para el terapeuta incluye además un menú tipo drawer con la navegación
// (en pantallas angostas no hay barra lateral).
export default function BarraSuperior() {
  const { usuario, logout } = useAuth()
  const nombre = usuario?.perfil?.nombres ?? usuario?.correo ?? ''
  const esTerapeuta = usuario?.rol === 'TERAPEUTA'

  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '14px 20px',
        background: 'var(--cp-surface)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {esTerapeuta && (
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={menuAbierto}
            aria-controls="menu-navegacion"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: 'var(--cp-surface-2)',
              border: '1px solid var(--cp-border)',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              color: 'var(--cp-text-1)',
            }}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        )}
        <Logo size={28} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            color: 'var(--cp-text-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {nombre}
        </span>
        <button
          type="button"
          onClick={logout}
          style={{
            padding: '7px 14px',
            background: 'var(--cp-surface-2)',
            color: 'var(--cp-text-1)',
            border: '1px solid var(--cp-border)',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--cp-font)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {esTerapeuta && menuAbierto && (
        <MenuNavegacion usuario={usuario} onCerrar={() => setMenuAbierto(false)} />
      )}
    </header>
  )
}

// Drawer de navegación: panel lateral con las mismas entradas que la barra
// lateral de escritorio. Cierra con Escape, clic fuera o al navegar.
function MenuNavegacion({ usuario, onCerrar }) {
  const navegar = useNavigate()
  const { pathname } = useLocation()
  const primerElementoRef = useRef(null)

  useEffect(() => {
    primerElementoRef.current?.focus()
    function alPresionar(evento) {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  const nombres = usuario?.perfil?.nombres ?? ''
  const apellidos = usuario?.perfil?.apellidos ?? ''

  return (
    <div
      onMouseDown={onCerrar}
      style={{ position: 'fixed', inset: 0, background: 'rgba(27,37,55,0.45)', zIndex: 60 }}
    >
      <nav
        id="menu-navegacion"
        aria-label="Navegación principal"
        onMouseDown={(evento) => evento.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'min(260px, 80vw)',
          background: 'var(--cp-surface)',
          borderRight: '1px solid var(--cp-border)',
          boxShadow: 'var(--sh-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 14px 14px 18px',
            borderBottom: '1px solid var(--cp-border)',
          }}
        >
          <Logo size={26} />
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              color: 'var(--cp-text-2)',
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: '12px 10px', flex: 1 }}>
          {ELEMENTOS_TERAPEUTA.map((elemento, indice) => {
            const activo = elemento.ruta === pathname
            return (
              <button
                key={elemento.id}
                ref={indice === 0 ? primerElementoRef : undefined}
                type="button"
                onClick={() => {
                  onCerrar()
                  navegar(elemento.ruta)
                }}
                aria-current={activo ? 'page' : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 12px',
                  marginBottom: 2,
                  border: 'none',
                  borderRadius: 'var(--r-md)',
                  background: activo ? 'var(--cp-blue-light)' : 'transparent',
                  color: activo ? 'var(--cp-blue-dark)' : 'var(--cp-text-2)',
                  fontFamily: 'var(--cp-font)',
                  fontSize: 14,
                  fontWeight: activo ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <elemento.icono size={17} aria-hidden="true" style={{ flexShrink: 0 }} />
                {elemento.etiqueta}
              </button>
            )
          })}
        </div>

        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--cp-border)',
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--cp-text-1)' }}>
            {nombres} {apellidos}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--cp-text-3)' }}>Terapeuta</div>
        </div>
      </nav>
    </div>
  )
}
