import { useEffect, useRef, useState } from 'react'

// Cuenta regresiva en segundos. Llama a `alAgotar` una sola vez al llegar a 0.
// Se detiene cuando `activa` es false (p. ej. mientras se muestra una pista o
// la pantalla de resultado).
export function useCuentaRegresiva(segundosIniciales, alAgotar, activa = true) {
  const [restante, setRestante] = useState(segundosIniciales)
  const alAgotarRef = useRef(alAgotar)
  alAgotarRef.current = alAgotar

  useEffect(() => {
    if (!activa) return undefined
    if (restante <= 0) {
      alAgotarRef.current?.()
      return undefined
    }
    const id = setTimeout(() => setRestante((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [restante, activa])

  return restante
}
