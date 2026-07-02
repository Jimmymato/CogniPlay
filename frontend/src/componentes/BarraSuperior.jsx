import Logo from './Logo'
import { useAuth } from '../caracteristicas/autenticacion/ContextoAuth'

// Barra superior compartida: marca, nombre del usuario y cierre de sesión.
export default function BarraSuperior() {
  const { usuario, logout } = useAuth()
  const nombre = usuario?.perfil?.nombres ?? usuario?.correo ?? ''

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'var(--cp-surface)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      <Logo size={28} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--cp-text-2)' }}>{nombre}</span>
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
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
