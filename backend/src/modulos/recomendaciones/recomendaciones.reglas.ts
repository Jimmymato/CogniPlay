import { UMBRALES } from '../progreso/progreso.reglas'

/**
 * Generación de textos de recomendación — lógica PURA (sin BD).
 *
 * Decisión de diseño v1: los textos se construyen por reglas en el backend
 * (no son plantillas almacenadas). Se reutilizan los mismos umbrales de
 * precisión del motor adaptativo para que el mensaje sea coherente con la
 * decisión de progresión que ya tomó el sistema.
 */
export function generarTextoRecomendacion(etiqueta: string, precision: number): string {
  if (precision >= UMBRALES.AUMENTAR) {
    return `${etiqueta}: desempeño excelente (precisión ${precision}%). Está listo para avanzar a mayor dificultad.`
  }
  if (precision >= UMBRALES.MANTENER) {
    return `${etiqueta}: buen desempeño (precisión ${precision}%). Conviene mantener el nivel y consolidar lo aprendido.`
  }
  if (precision >= UMBRALES.REDUCIR) {
    return `${etiqueta}: desempeño irregular (precisión ${precision}%). Se recomienda reforzar con actividades de menor dificultad.`
  }
  return `${etiqueta}: desempeño bajo (precisión ${precision}%). Requiere refuerzo prioritario de esta función ejecutiva.`
}
