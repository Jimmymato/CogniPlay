import { useEffect } from 'react'

// Cáscara accesible compartida por los modales de la vista del niño
// (mismo patrón que ModalRegistrarNino: overlay, role=dialog, cierre con
// Escape y clic fuera).
export default function ModalBase({ titulo, descripcion, onCerrar, children }) {
  useEffect(() => {
    function alPresionar(evento) {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  const idTitulo = `titulo-modal-${titulo.replace(/\s+/g, '-').toLowerCase()}`

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
        aria-labelledby={idTitulo}
        onMouseDown={(evento) => evento.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--cp-surface)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-lg)',
          padding: 24,
        }}
      >
        <h2
          id={idTitulo}
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}
        >
          {titulo}
        </h2>
        {descripcion && (
          <p style={{ fontSize: 13, color: 'var(--cp-text-2)', marginBottom: 18 }}>
            {descripcion}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
