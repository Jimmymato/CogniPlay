import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Logo from '../../componentes/Logo'
import { rutaInicioPorRol } from '../../app/enrutador/rutas'
import { useAuth } from './ContextoAuth'

const estilos = {
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid var(--cp-border)',
    borderRadius: 'var(--r-md)',
    fontSize: 14,
    color: 'var(--cp-text-1)',
    background: 'var(--cp-surface)',
    fontFamily: 'var(--cp-font)',
    outline: 'none',
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--cp-text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
}

export default function PantallaLogin() {
  const { login, usuario, cargando } = useAuth()
  const navegar = useNavigate()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si ya hay sesión, no tiene sentido ver el login: se reubica por rol.
  if (!cargando && usuario) {
    return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const autenticado = await login(correo.trim(), contrasena)
      navegar(rutaInicioPorRol(autenticado.rol), { replace: true })
    } catch (fallo) {
      setError(fallo.mensaje ?? 'No se pudo iniciar sesión')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Logo size={36} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--cp-text-3)' }}>
          Plataforma de estimulación de funciones ejecutivas
        </p>
      </div>

      <form
        onSubmit={manejarEnvio}
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-sm)',
          padding: '28px 24px',
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: 4,
          }}
        >
          Iniciar sesión
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cp-text-2)', marginBottom: 22 }}>
          Accede a tu cuenta para continuar
        </p>

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="correo" style={estilos.label}>
            Correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            autoComplete="username"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={estilos.input}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div style={{ marginBottom: error ? 12 : 22 }}>
          <label htmlFor="contrasena" style={estilos.label}>
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={estilos.input}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: 13,
              color: 'var(--cp-red-text)',
              background: 'var(--cp-red-bg)',
              border: '1px solid var(--cp-red-border)',
              borderRadius: 'var(--r-md)',
              padding: '9px 12px',
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          style={{
            width: '100%',
            padding: 13,
            background: enviando ? 'var(--cp-blue-mid)' : 'var(--cp-blue)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'var(--cp-font)',
            cursor: enviando ? 'default' : 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p style={{ fontSize: 11, color: 'var(--cp-text-3)', marginTop: 20 }}>
        CogniPlay v1.0 · Plataforma de apoyo terapéutico
      </p>
    </div>
  )
}
