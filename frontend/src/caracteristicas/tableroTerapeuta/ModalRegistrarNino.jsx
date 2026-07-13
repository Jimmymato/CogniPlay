import { useEffect, useRef, useState } from 'react'
import { crearNino } from '../../servicios/ninos.servicio'

// Estado inicial del formulario de alta.
const FORMULARIO_VACIO = {
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  correo: '',
  contrasena: '',
}

// Modal para registrar un nuevo niño. Al crearlo con éxito informa al panel
// mediante onCreado(nino) y se cierra. Toda la HTTP vive en el servicio.
export default function ModalRegistrarNino({ onCerrar, onCreado }) {
  const [datos, setDatos] = useState(FORMULARIO_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const primerCampoRef = useRef(null)

  // Foco inicial y cierre con la tecla Escape (accesibilidad).
  useEffect(() => {
    primerCampoRef.current?.focus()
    function alPresionar(evento) {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  function actualizar(campo) {
    return (evento) => setDatos((previo) => ({ ...previo, [campo]: evento.target.value }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const nino = await crearNino({
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        fechaNacimiento: datos.fechaNacimiento,
        correo: datos.correo.trim(),
        contrasena: datos.contrasena,
      })
      onCreado(nino)
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo registrar al niño.')
      setEnviando(false)
    }
  }

  return (
    <div
      onMouseDown={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27,37,55,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-registrar-nino"
        onMouseDown={(evento) => evento.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          maxHeight: '90dvh',
          overflowY: 'auto',
          background: 'var(--cp-surface)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-lg)',
          padding: 24,
        }}
      >
        <h2
          id="titulo-registrar-nino"
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}
        >
          Registrar niño
        </h2>
        <p style={{ fontSize: 13, color: 'var(--cp-text-2)', marginBottom: 18 }}>
          Se creará su acceso al sistema con el correo y la contraseña indicados.
        </p>

        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* En pantallas angostas la fila se parte y queda en una columna. */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Campo etiqueta="Nombres" style={{ flex: 1, minWidth: 150 }}>
              <input
                ref={primerCampoRef}
                type="text"
                required
                value={datos.nombres}
                onChange={actualizar('nombres')}
                style={estiloEntrada}
              />
            </Campo>
            <Campo etiqueta="Apellidos" style={{ flex: 1, minWidth: 150 }}>
              <input
                type="text"
                required
                value={datos.apellidos}
                onChange={actualizar('apellidos')}
                style={estiloEntrada}
              />
            </Campo>
          </div>

          <Campo etiqueta="Fecha de nacimiento">
            <input
              type="date"
              required
              value={datos.fechaNacimiento}
              onChange={actualizar('fechaNacimiento')}
              style={estiloEntrada}
            />
          </Campo>

          <Campo etiqueta="Correo">
            <input
              type="email"
              required
              autoComplete="off"
              value={datos.correo}
              onChange={actualizar('correo')}
              style={estiloEntrada}
            />
          </Campo>

          <Campo etiqueta="Contraseña">
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={datos.contrasena}
              onChange={actualizar('contrasena')}
              style={estiloEntrada}
            />
          </Campo>

          {error && (
            <p role="alert" style={{ fontSize: 13, color: 'var(--cp-red-text)' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onCerrar} disabled={enviando} style={estiloBotonSecundario}>
              Cancelar
            </button>
            <button type="submit" disabled={enviando} style={estiloBotonPrimario}>
              {enviando ? 'Registrando…' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Etiqueta + control de formulario asociados accesiblemente.
function Campo({ etiqueta, children, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>{etiqueta}</span>
      {children}
    </label>
  )
}

const estiloEntrada = {
  width: '100%',
  padding: '9px 11px',
  fontSize: 14,
  fontFamily: 'var(--cp-font)',
  color: 'var(--cp-text-1)',
  background: 'var(--cp-surface-2)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  boxSizing: 'border-box',
}

const estiloBotonPrimario = {
  padding: '9px 18px',
  background: 'var(--cp-blue)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}

const estiloBotonSecundario = {
  padding: '9px 16px',
  background: 'var(--cp-surface-2)',
  color: 'var(--cp-text-1)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}
