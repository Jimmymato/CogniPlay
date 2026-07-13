import { UMBRALES } from '../progreso/progreso.reglas'

/**
 * Reglas del módulo de reportes — lógica PURA (sin acceso a BD).
 *
 * Clasifica el desempeño promedio por función ejecutiva y construye el
 * resumen en lenguaje de apoyo. Reutiliza los umbrales del motor adaptativo
 * para que el reporte sea coherente con las decisiones de progresión.
 * Importante: los textos describen el desempeño observado en la plataforma;
 * nunca formulan diagnósticos clínicos.
 */

export type CategoriaDesempeno =
  | 'FUERTE'
  | 'ADECUADO'
  | 'IRREGULAR'
  | 'NECESITA_REFUERZO'

/** Clasifica una precisión promedio (0–100) en una categoría de desempeño. */
export function clasificarPrecision(precision: number): CategoriaDesempeno {
  if (precision >= UMBRALES.AUMENTAR) return 'FUERTE'
  if (precision >= UMBRALES.MANTENER) return 'ADECUADO'
  if (precision >= UMBRALES.REDUCIR) return 'IRREGULAR'
  return 'NECESITA_REFUERZO'
}

export interface EntradaResumenFuncion {
  etiqueta: string
  precisionPromedio: number
  intentos: number
}

/**
 * Genera el resumen del periodo en lenguaje de apoyo (lista de frases).
 * Solo considera funciones con al menos un intento en el periodo.
 */
export function generarResumenApoyo(entradas: EntradaResumenFuncion[]): string[] {
  const conDatos = entradas.filter((e) => e.intentos > 0)
  if (conDatos.length === 0) {
    return [
      'En el periodo seleccionado no se registraron intentos, por lo que no hay desempeño que describir.',
      'Se recomienda revisar la frecuencia de uso de la plataforma junto con la familia.',
    ]
  }

  const frases: string[] = []
  const fuertes = conDatos.filter(
    (e) => clasificarPrecision(e.precisionPromedio) === 'FUERTE',
  )
  const refuerzo = conDatos.filter((e) => {
    const categoria = clasificarPrecision(e.precisionPromedio)
    return categoria === 'IRREGULAR' || categoria === 'NECESITA_REFUERZO'
  })

  const totalIntentos = conDatos.reduce((suma, e) => suma + e.intentos, 0)
  frases.push(
    `Durante el periodo se registraron ${totalIntentos} intentos en ${conDatos.length} función(es) ejecutiva(s).`,
  )

  if (fuertes.length > 0) {
    frases.push(
      `El desempeño observado indica avances consistentes en: ${fuertes
        .map((e) => e.etiqueta)
        .join(', ')}.`,
    )
  }
  if (refuerzo.length > 0) {
    frases.push(
      `El desempeño observado sugiere dedicar más práctica a: ${refuerzo
        .map((e) => e.etiqueta)
        .join(', ')}.`,
    )
  }
  if (fuertes.length === 0 && refuerzo.length === 0) {
    frases.push(
      'El desempeño observado se mantiene en un rango adecuado; conviene continuar con la rutina actual de actividades.',
    )
  }

  frases.push(
    'Estas observaciones describen el desempeño dentro de la plataforma y no constituyen un diagnóstico; se recomienda la revisión por parte del terapeuta.',
  )
  return frases
}
