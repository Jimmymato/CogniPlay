// Insignia tipo semáforo que muestra un porcentaje de precisión con el color
// correspondiente. Reutiliza los umbrales de la plataforma: verde ≥85,
// ámbar 60–84, rojo <60.
function coloresPorPrecision(precision) {
  if (precision >= 85) {
    return { texto: 'var(--cp-green-text)', fondo: 'var(--cp-green-bg)', borde: 'var(--cp-green-border)' }
  }
  if (precision >= 60) {
    return { texto: 'var(--cp-amber-text)', fondo: 'var(--cp-amber-bg)', borde: 'var(--cp-amber-border)' }
  }
  return { texto: 'var(--cp-red-text)', fondo: 'var(--cp-red-bg)', borde: 'var(--cp-red-border)' }
}

export default function InsigniaPrecision({ precision, etiqueta = 'Última' }) {
  // La precisión llega como número o como cadena (Decimal serializado); se normaliza.
  const valor = Math.round(Number(precision))
  const c = coloresPorPrecision(valor)

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 9px',
        fontSize: 11,
        fontWeight: 600,
        color: c.texto,
        background: c.fondo,
        border: `1px solid ${c.borde}`,
        borderRadius: 'var(--r-pill)',
        whiteSpace: 'nowrap',
      }}
    >
      {etiqueta} {valor}%
    </span>
  )
}
