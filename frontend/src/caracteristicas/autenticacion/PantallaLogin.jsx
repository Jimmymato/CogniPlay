import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Logo from '../../componentes/Logo'
import { rutaInicioPorRol } from '../../app/enrutador/rutas'
import { useAuth } from './ContextoAuth'

// Bajo este ancho se conserva intacto el login de móvil (ya validado en 360 y
// 390 px); a partir de él se usa la composición amplia pensada para escritorio.
const ANCHO_ESCRITORIO = 700

function usePantallaAncha() {
  const [ancha, setAncha] = useState(
    () => window.matchMedia(`(min-width:${ANCHO_ESCRITORIO}px)`).matches,
  )

  useEffect(() => {
    const consulta = window.matchMedia(`(min-width:${ANCHO_ESCRITORIO}px)`)
    const alCambiar = (evento) => setAncha(evento.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  return ancha
}

// Manchas suaves de la paleta de marca: llenan el vacío de las pantallas
// grandes sin competir con el formulario. Solo se pintan en escritorio.
const FONDO = `
  radial-gradient(760px 520px at 14% 16%, rgba(74,143,231,0.30), transparent 62%),
  radial-gradient(680px 480px at 88% 82%, rgba(123,108,212,0.26), transparent 64%),
  radial-gradient(560px 420px at 76% 10%, rgba(60,185,170,0.20), transparent 66%),
  var(--cp-bg)
`

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

// Mismos campos, con las medidas escaladas para escritorio.
const estilosAnchos = {
  input: {
    ...estilos.input,
    padding: 'clamp(11px, 1.1vw, 15px) clamp(14px, 1.3vw, 18px)',
    fontSize: 'clamp(14px, 1.15vw, 16px)',
  },
  label: { ...estilos.label, marginBottom: 7, fontSize: 'clamp(11px, 0.9vw, 12px)' },
}

export default function PantallaLogin() {
  const { login, usuario, cargando } = useAuth()
  const navegar = useNavigate()
  const pantallaAncha = usePantallaAncha()

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

  const campos = pantallaAncha ? estilosAnchos : estilos

  // En móvil la marca va sobre la tarjeta; en escritorio entra dentro de ella
  // para que la tarjeta ancha no quede descabezada.
  const marca = (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <Logo size={pantallaAncha ? 44 : 36} />
      </div>
      <p
        style={{
          fontSize: pantallaAncha ? 'clamp(12px, 1.05vw, 14.5px)' : 12,
          color: 'var(--cp-text-3)',
        }}
      >
        Plataforma de estimulación de funciones ejecutivas
      </p>
    </>
  )

  return (
    <div
      style={{
        minHeight: '100%',
        background: pantallaAncha ? FONDO : undefined,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      {!pantallaAncha && <div style={{ textAlign: 'center', marginBottom: 20 }}>{marca}</div>}

      <form
        onSubmit={manejarEnvio}
        style={{
          width: '100%',
          maxWidth: pantallaAncha ? 560 : 380,
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: pantallaAncha ? 'clamp(20px, 1.7vw, 24px)' : 'var(--r-xl)',
          boxShadow: pantallaAncha ? 'var(--sh-lg)' : 'var(--sh-sm)',
          padding: pantallaAncha
            ? 'clamp(28px, 3.4vw, 48px) clamp(24px, 3.6vw, 52px)'
            : '28px 24px',
        }}
      >
        {pantallaAncha && (
          <div style={{ textAlign: 'center', marginBottom: 'clamp(22px, 2.3vw, 32px)' }}>
            {marca}
          </div>
        )}

        <h1
          style={{
            fontSize: pantallaAncha ? 'clamp(20px, 2.1vw, 29px)' : 20,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            textAlign: pantallaAncha ? 'center' : 'left',
            marginBottom: pantallaAncha ? 5 : 4,
          }}
        >
          Iniciar sesión
        </h1>
        <p
          style={{
            fontSize: pantallaAncha ? 'clamp(13px, 1.1vw, 15.5px)' : 13,
            color: 'var(--cp-text-2)',
            textAlign: pantallaAncha ? 'center' : 'left',
            marginBottom: pantallaAncha ? 'clamp(22px, 2.2vw, 30px)' : 22,
          }}
        >
          Accede a tu cuenta para continuar
        </p>

        <div style={{ marginBottom: pantallaAncha ? 'clamp(14px, 1.3vw, 18px)' : 14 }}>
          <label htmlFor="correo" style={campos.label}>
            Correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            autoComplete="username"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            style={campos.input}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div
          style={{
            marginBottom: error ? 12 : pantallaAncha ? 'clamp(22px, 2.1vw, 28px)' : 22,
          }}
        >
          <label htmlFor="contrasena" style={campos.label}>
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={campos.input}
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
            padding: pantallaAncha ? 'clamp(13px, 1.15vw, 16px)' : 13,
            background: enviando ? 'var(--cp-blue-mid)' : 'var(--cp-blue)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--r-md)',
            fontSize: pantallaAncha ? 'clamp(14px, 1.2vw, 16.5px)' : 14,
            fontWeight: 600,
            fontFamily: 'var(--cp-font)',
            cursor: enviando ? 'default' : 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p
        style={{
          fontSize: pantallaAncha ? 'clamp(11px, 0.95vw, 13px)' : 11,
          color: 'var(--cp-text-3)',
          marginTop: pantallaAncha ? 'clamp(20px, 1.9vw, 26px)' : 20,
        }}
      >
        CogniPlay v1.0 · Plataforma de apoyo terapéutico
      </p>
    </div>
  )
}
