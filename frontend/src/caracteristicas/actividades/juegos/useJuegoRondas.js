import { useRef, useState } from 'react'
import { useCuentaRegresiva } from './useCuentaRegresiva'

// Hook para juegos por rondas con una respuesta por ítem (selección).
// Centraliza: índice actual, conteo de aciertos/errores, cuenta regresiva
// global, retroalimentación breve antes de avanzar y cálculo de omisiones
// (ítems no respondidos cuando se agota el tiempo).
//
// El juego llama a `registrar(esCorrecto, alAvanzar)` al responder un ítem.
// `alAvanzar` (opcional) se ejecuta tras la retroalimentación, p. ej. para
// limpiar la selección visual de la ronda.
export function useJuegoRondas({ items, tiempoLimiteSegundos, onTerminar, msFeedback = 700 }) {
  const [indice, setIndice] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)
  const aciertosRef = useRef(0)
  const erroresRef = useRef(0)
  const finalizadoRef = useRef(false)
  const inicioRef = useRef(Date.now())

  function finalizar() {
    if (finalizadoRef.current) return
    finalizadoRef.current = true
    const respondidas = aciertosRef.current + erroresRef.current
    onTerminar({
      respuestasCorrectas: aciertosRef.current,
      respuestasIncorrectas: erroresRef.current,
      omisiones: items - respondidas,
      tiempoSegundos: Math.min(
        tiempoLimiteSegundos,
        Math.round((Date.now() - inicioRef.current) / 1000),
      ),
    })
  }

  // La cuenta regresiva se pausa durante la retroalimentación y al finalizar.
  const restante = useCuentaRegresiva(
    tiempoLimiteSegundos,
    finalizar,
    !bloqueado && !finalizadoRef.current,
  )

  function registrar(esCorrecto, alAvanzar) {
    if (bloqueado || finalizadoRef.current) return
    setBloqueado(true)
    if (esCorrecto) aciertosRef.current += 1
    else erroresRef.current += 1

    setTimeout(() => {
      alAvanzar?.()
      if (indice + 1 >= items) {
        finalizar()
      } else {
        setIndice((i) => i + 1)
        setBloqueado(false)
      }
    }, msFeedback)
  }

  return { indice, restante, bloqueado, registrar, total: items }
}
