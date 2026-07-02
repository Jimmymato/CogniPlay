import { useState } from 'react'
import { crearObservacion } from '../../../servicios/observaciones.servicio'
import { formatearFechaHora } from './etiquetas'
import { tarjeta, tituloSeccion, estiloEntrada, botonPrimario } from './estilos'

const LARGO_MAXIMO = 2000

// Observaciones clínicas del terapeuta sobre el niño: campo para registrar
// una nueva y lista descendente de las anteriores.
export default function SeccionObservaciones({ ninoId, observaciones, onCreada }) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await crearObservacion({ ninoId, texto: texto.trim() })
      setTexto('')
      onCreada()
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo guardar la observación.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section style={tarjeta} aria-label="Observaciones del terapeuta">
      <h2 style={tituloSeccion}>Observaciones</h2>

      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea
          rows={3}
          value={texto}
          maxLength={LARGO_MAXIMO}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe una observación sobre el niño…"
          aria-label="Nueva observación"
          style={{ ...estiloEntrada, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--cp-text-3)' }}>
            {texto.length}/{LARGO_MAXIMO}
          </span>
          <button
            type="submit"
            disabled={enviando || texto.trim().length === 0}
            style={{
              ...botonPrimario,
              opacity: enviando || texto.trim().length === 0 ? 0.6 : 1,
              cursor: enviando || texto.trim().length === 0 ? 'default' : 'pointer',
            }}
          >
            {enviando ? 'Guardando…' : 'Guardar observación'}
          </button>
        </div>
        {error && (
          <p role="alert" style={{ fontSize: 13, color: 'var(--cp-red-text)' }}>
            {error}
          </p>
        )}
      </form>

      {observaciones.length > 0 && (
        <ol style={{ listStyle: 'none', margin: '14px 0 0', padding: 0 }}>
          {observaciones.map((obs) => (
            <li
              key={obs.id}
              style={{
                padding: '10px 0',
                borderTop: '1px solid var(--cp-border)',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--cp-text-1)', margin: '0 0 4px' }}>
                {obs.texto}
              </p>
              <span style={{ fontSize: 11.5, color: 'var(--cp-text-3)' }}>
                {obs.terapeuta?.nombres} {obs.terapeuta?.apellidos} ·{' '}
                {formatearFechaHora(obs.creadoEn)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
