// Estilos compartidos por las secciones de la vista individual del niño,
// coherentes con los de PanelTerapeuta.

export const tarjeta = {
  background: 'var(--cp-surface)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-lg)',
  boxShadow: 'var(--sh-sm)',
  padding: 18,
}

export const tituloSeccion = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--cp-text-1)',
  letterSpacing: '-0.01em',
  marginBottom: 12,
}

export const estiloEntrada = {
  padding: '9px 11px',
  fontSize: 14,
  fontFamily: 'var(--cp-font)',
  color: 'var(--cp-text-1)',
  background: 'var(--cp-surface-2)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  boxSizing: 'border-box',
}

export const botonPrimario = {
  padding: '9px 16px',
  background: 'var(--cp-blue)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--r-md)',
  fontSize: 13.5,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}

export const botonSecundario = {
  padding: '9px 14px',
  background: 'var(--cp-surface-2)',
  color: 'var(--cp-text-1)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-md)',
  fontSize: 13.5,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}

export const botonFila = {
  padding: '5px 10px',
  background: 'var(--cp-surface-2)',
  color: 'var(--cp-text-1)',
  border: '1px solid var(--cp-border)',
  borderRadius: 'var(--r-sm)',
  fontSize: 12.5,
  fontWeight: 600,
  fontFamily: 'var(--cp-font)',
  cursor: 'pointer',
}

// Píldora semáforo genérica.
export function pildora(colorTexto, colorFondo, colorBorde) {
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 'var(--r-pill)',
    fontSize: 11.5,
    fontWeight: 600,
    color: colorTexto,
    background: colorFondo,
    border: `1px solid ${colorBorde}`,
    whiteSpace: 'nowrap',
  }
}
