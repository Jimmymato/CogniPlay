// Indicador de carga a pantalla completa, usado mientras se valida la sesión.
export default function PantallaCargando({ mensaje = 'Cargando…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        color: 'var(--cp-text-2)',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          border: '3px solid var(--cp-border)',
          borderTopColor: 'var(--cp-blue)',
          borderRadius: '50%',
          animation: 'cp-girar 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 13 }}>{mensaje}</span>
      <style>{'@keyframes cp-girar { to { transform: rotate(360deg) } }'}</style>
    </div>
  )
}
