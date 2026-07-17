// Estilos compartidos de los juegos. Centralizan tamaños táctiles amplios,
// tipografía legible y los colores de estado (correcta/incorrecta) para que
// los siete juegos se vean y se sientan como un mismo sistema.

// Raíz de cada juego: ocupa todo el escenario para poder centrar su contenido.
export const estiloJuegoRaiz = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
}

// Zona central del juego (debajo de la cabecera): centra vertical y
// horizontalmente el contenido dentro del escenario.
export const estiloZonaJuego = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}

// Instrucción principal del juego: grande y clara.
export const estiloInstruccion = {
  textAlign: 'center',
  fontSize: 'clamp(18px, 2vw, 30px)',
  lineHeight: 1.45,
  color: 'var(--cp-text-1)',
  marginBottom: 18,
}

// Texto de pista (solo en nivel Fácil).
export const estiloPista = {
  textAlign: 'center',
  fontSize: 'clamp(14px, 1.5vw, 20px)',
  color: 'var(--cp-text-3)',
  marginBottom: 14,
}

// Colores de una opción según su estado tras responder.
export function coloresOpcion(estado) {
  if (estado === 'correcta') {
    return { borde: 'var(--cp-green-border)', fondo: 'var(--cp-green-bg)' }
  }
  if (estado === 'incorrecta') {
    return { borde: 'var(--cp-red-border)', fondo: 'var(--cp-red-bg)' }
  }
  return { borde: 'var(--cp-border)', fondo: 'var(--cp-surface)' }
}

// Botón de opción de respuesta: objetivo táctil amplio (≥60 px de alto).
export function estiloOpcion(estado, bloqueado, extra = {}) {
  const { borde, fondo } = coloresOpcion(estado)
  return {
    minHeight: 'clamp(64px, 9vh, 100px)',
    padding: '18px 24px',
    background: fondo,
    border: `2px solid ${borde}`,
    borderRadius: 'var(--r-lg)',
    cursor: bloqueado ? 'default' : 'pointer',
    fontFamily: 'var(--cp-font)',
    boxShadow: 'var(--sh-xs)',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    ...extra,
  }
}

// Botón principal de acción (continuar, empezar, etc.).
export function estiloBotonPrincipal(color, extra = {}) {
  return {
    minHeight: 'clamp(64px, 8vh, 84px)',
    padding: '18px 44px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: 'var(--r-lg)',
    fontSize: 'clamp(18px, 1.8vw, 24px)',
    fontWeight: 700,
    fontFamily: 'var(--cp-font)',
    cursor: 'pointer',
    boxShadow: 'var(--sh-sm)',
    ...extra,
  }
}
