import { useState } from 'react'
import ModalBase from './ModalBase'
import { asignarRefuerzo } from '../../../servicios/refuerzos.servicio'
import { botonPrimario, botonSecundario, estiloEntrada } from './estilos'

// Asignación manual de un refuerzo (función ejecutiva obligatoria, actividad
// opcional filtrada por la función elegida).
export default function ModalAsignarRefuerzo({ ninoId, funciones, onExito, onCerrar }) {
  const [funcionEjecutivaId, setFuncionEjecutivaId] = useState(funciones[0]?.id ?? '')
  const [actividadId, setActividadId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const funcionElegida = funciones.find((f) => f.id === funcionEjecutivaId)
  const actividades = funcionElegida?.actividades ?? []

  function cambiarFuncion(id) {
    setFuncionEjecutivaId(id)
    setActividadId('') // la actividad debe pertenecer a la función elegida
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await asignarRefuerzo({
        ninoId,
        funcionEjecutivaId,
        actividadId: actividadId || undefined,
        motivo: motivo.trim(),
      })
      onExito()
    } catch (err) {
      setError(err.mensaje ?? 'No se pudo asignar el refuerzo.')
      setEnviando(false)
    }
  }

  return (
    <ModalBase
      titulo="Asignar refuerzo"
      descripcion="Marca una función ejecutiva que necesita trabajo adicional."
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>
            Función ejecutiva
          </span>
          <select
            required
            value={funcionEjecutivaId}
            onChange={(e) => cambiarFuncion(e.target.value)}
            style={estiloEntrada}
          >
            {funciones.map((f) => (
              <option key={f.id} value={f.id}>
                {f.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>
            Actividad (opcional)
          </span>
          <select
            value={actividadId}
            onChange={(e) => setActividadId(e.target.value)}
            style={estiloEntrada}
          >
            <option value="">Toda la función</option>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--cp-text-2)' }}>
            Motivo
          </span>
          <textarea
            rows={3}
            required
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="¿Qué se busca reforzar y por qué?"
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
            {enviando ? 'Asignando…' : 'Asignar refuerzo'}
          </button>
        </div>
      </form>
    </ModalBase>
  )
}
