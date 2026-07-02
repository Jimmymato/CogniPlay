import { Construction } from 'lucide-react'

// Marcador para las actividades cuyo juego todavía no se ha implementado.
// Mantiene el flujo del reproductor sin registrar ningún intento.
export default function JuegoPendiente() {
  return (
    <div style={{ textAlign: 'center', padding: '44px 16px', color: 'var(--cp-text-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }} aria-hidden="true">
        <Construction size={44} strokeWidth={1.5} color="var(--cp-text-3)" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--cp-text-1)', marginBottom: 4 }}>
        Juego en preparación
      </p>
      <p style={{ fontSize: 13 }}>Esta actividad estará disponible muy pronto.</p>
    </div>
  )
}
