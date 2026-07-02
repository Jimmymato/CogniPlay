import { useEffect, useState } from 'react'

// Punto de quiebre compartido: desde aquí se considera "escritorio".
export const CONSULTA_ESCRITORIO = '(min-width: 1024px)'

// Indica si el viewport cumple una media query, reaccionando a los cambios
// de tamaño (los estilos en línea no admiten media queries de CSS).
export default function useMediaQuery(consulta) {
  const [coincide, setCoincide] = useState(() => window.matchMedia(consulta).matches)

  useEffect(() => {
    const lista = window.matchMedia(consulta)
    const alCambiar = (evento) => setCoincide(evento.matches)
    lista.addEventListener('change', alCambiar)
    setCoincide(lista.matches)
    return () => lista.removeEventListener('change', alCambiar)
  }, [consulta])

  return coincide
}
