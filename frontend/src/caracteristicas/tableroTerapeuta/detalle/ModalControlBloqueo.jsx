import { useState } from 'react'
import ModalBase from './ModalBase'
import { cambiarBloqueoActividad } from '../../../servicios/progreso.servicio'
import { botonPrimario, botonSecundario, estiloEntrada } from './estilos'

// Bloqueo o desbloqueo manual de una actividad para el niño.
export default function ModalControlBloqueo({ ninoId, actividad, bloqueada, onExito, onCerrar }) {
  const [razon, setRazon] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const bloquear = !bloqueada

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await cambiarBloqueoActividad({
        ninoId,
        actividadId: actividad.id,
        bloqueada: bloquear,
        razon,
      })
      onExito()
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo cambiar el bloqueo.')
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo={bloquear ? 'Bloquear actividad' : 'Desbloquear actividad'}
      descripcion={
        bloquear
          ? `El niño no podrá jugar "${actividad.nombre}" hasta que la desbloquees.`
          : `El niño volverá a poder jugar "${actividad.nombre}".`
      }
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>
            Motivo (opcional)
          </span>
          <textarea
            rows={3}
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            placeholder="¿Por qué se cambia el acceso a esta actividad?"
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
            {enviando ? 'Guardando…' : bloquear ? 'Bloquear' : 'Desbloquear'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}
