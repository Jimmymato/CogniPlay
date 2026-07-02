import { useState } from 'react'
import ModalBase from './ModalBase'
import { cambiarNivelActividad } from '../../../servicios/progreso.servicio'
import { NIVELES, ETIQUETA_NIVEL } from './etiquetas'
import { botonPrimario, botonSecundario, estiloEntrada } from './estilos'

// Cambio manual de dificultad de una actividad para el niño.
export default function ModalControlNivel({ ninoId, actividad, nivelActual, onExito, onCerrar }) {
  const opciones = NIVELES.filter((n) => n !== nivelActual)
  const [nivel, setNivel] = useState(opciones[0])
  const [razon, setRazon] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await cambiarNivelActividad({ ninoId, actividadId: actividad.id, nivel, razon })
      onExito()
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo cambiar el nivel.')
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Cambiar dificultad"
      descripcion={`${actividad.nombre} — nivel actual: ${
        nivelActual ? ETIQUETA_NIVEL[nivelActual] : 'sin iniciar'
      }`}
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>
            Nuevo nivel
          </span>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} style={estiloEntrada}>
            {opciones.map((n) => (
              <option key={n} value={n}>
                {ETIQUETA_NIVEL[n]}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>
            Motivo (opcional)
          </span>
          <textarea
            rows={3}
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            placeholder="¿Por qué se ajusta la dificultad?"
            style={{ ...estiloEntrada, resize: 'vertical' }}
          />
        </label>

        {error && (
          <p role="alert" style={{ fontSize: 13, color: 'var(--cp-red-text)' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onCerrar} disabled={enviando} style={botonSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={enviando} style={botonPrimario}>
            {enviando ? 'Guardando…' : 'Cambiar nivel'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}
