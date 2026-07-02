import { Smile } from 'lucide-react'

// Mensaje genérico para cuando una sección no tiene datos o falla la carga.
// `icono` recibe un componente de lucide-react (no un elemento ya montado).
export default function EstadoVacio({ icono: Icono = Smile, titulo, mensaje, accion }) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8,
        padding: '40px 20px',
        color: 'var(--cp-text-2)',
      }}
    >
      <Icono size={36} strokeWidth={1.7} color="var(--cp-text-3)" aria-hidden="true" />
      {titulo && (
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--cp-text-1)' }}>
          {titulo}
        </p>
      )}
      {mensaje && <p style={{ fontSize: 13, maxWidth: 320 }}>{mensaje}</p>}
      {accion}
    </div>
  )
}
