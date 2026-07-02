// Figura geométrica simple rellena de color, usada en los juegos que requieren
// distinguir forma y color (p. ej. "Cambia la Regla").
export default function Figura({ forma, color, tam = 56 }) {
  const comun = { width: tam, height: tam, display: 'block' }
  if (forma === 'circulo') {
    return (
      <svg style={comun} viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill={color} />
      </svg>
    )
  }
  if (forma === 'cuadrado') {
    return (
      <svg style={comun} viewBox="0 0 100 100" aria-hidden="true">
        <rect x="12" y="12" width="76" height="76" rx="14" fill={color} />
      </svg>
    )
  }
  // triángulo
  return (
    <svg style={comun} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,12 90,86 10,86" fill={color} />
    </svg>
  )
}
