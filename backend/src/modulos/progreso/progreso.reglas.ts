import type { NivelDificultad, TipoDecision } from '@prisma/client'

/**
 * Motor adaptativo de progresión — lógica PURA (sin acceso a BD).
 *
 * A partir del resultado de un intento decide cómo debe evolucionar el niño en
 * la actividad: subir, mantener, bajar el nivel, repetir o recibir un refuerzo.
 * Los umbrales están centralizados aquí para poder ajustarlos en un solo lugar.
 */

/** Umbrales de precisión (en %) que delimitan cada franja de desempeño. */
export const UMBRALES = {
  /** ≥ AUMENTAR (y completado) → sube de nivel o desbloquea la siguiente actividad. */
  AUMENTAR: 85,
  /** ≥ MANTENER → desempeño adecuado, se mantiene el nivel. */
  MANTENER: 60,
  /** ≥ REDUCIR → desempeño bajo, se reduce el nivel o se repite. */
  REDUCIR: 40,
  // < REDUCIR → desempeño muy bajo, se asigna un refuerzo.
} as const

/** Orden ascendente de dificultad. */
export const ORDEN_NIVELES: NivelDificultad[] = ['FACIL', 'MEDIO', 'DIFICIL']

/** Devuelve el nivel inmediatamente superior, o null si ya es el máximo. */
export function nivelSiguiente(nivel: NivelDificultad): NivelDificultad | null {
  const i = ORDEN_NIVELES.indexOf(nivel)
  return i >= 0 && i < ORDEN_NIVELES.length - 1 ? ORDEN_NIVELES[i + 1] : null
}

/** Devuelve el nivel inmediatamente inferior, o null si ya es el mínimo. */
export function nivelPrevio(nivel: NivelDificultad): NivelDificultad | null {
  const i = ORDEN_NIVELES.indexOf(nivel)
  return i > 0 ? ORDEN_NIVELES[i - 1] : null
}

export interface EntradaEvaluacion {
  /** Precisión del intento en porcentaje (0–100). */
  precision: number
  /** true si no hubo omisiones (la actividad se completó por entero). */
  completado: boolean
  /** Nivel en el que se realizó el intento. */
  nivel: NivelDificultad
}

export interface ResultadoEvaluacion {
  decision: TipoDecision
  nivelAnterior: NivelDificultad
  /** Nivel resultante tras la decisión (igual al anterior si no cambia). */
  nivelNuevo: NivelDificultad
  /** true cuando el niño domina el nivel máximo y supera la actividad. */
  nivelSuperado: boolean
  /** true cuando debe generarse un Refuerzo PENDIENTE. */
  asignarRefuerzo: boolean
  /** Texto explicativo de la decisión (se guarda en DecisionProgresion.razon). */
  razon: string
}

/**
 * Evalúa el desempeño de un intento y decide la progresión.
 *
 * Reglas (sobre la precisión del intento):
 *  - ≥ 85 y completado:
 *      · nivel < DIFICIL → AUMENTAR_DIFICULTAD (sube un nivel)
 *      · nivel = DIFICIL → DESBLOQUEAR_SIGUIENTE_ACTIVIDAD (nivelSuperado)
 *  - ≥ 85 pero con omisiones → MANTENER_DIFICULTAD (no se promueve)
 *  - 60–84 → MANTENER_DIFICULTAD
 *  - 40–59:
 *      · nivel > FACIL → REDUCIR_DIFICULTAD (baja un nivel)
 *      · nivel = FACIL → REPETIR_ACTIVIDAD
 *  - < 40 → ASIGNAR_REFUERZO (+ Refuerzo PENDIENTE)
 */
export function evaluarProgresion(entrada: EntradaEvaluacion): ResultadoEvaluacion {
  const { precision, completado, nivel } = entrada
  const base = { nivelAnterior: nivel, nivelSuperado: false, asignarRefuerzo: false }

  // ── Desempeño alto ────────────────────────────────────────
  if (precision >= UMBRALES.AUMENTAR) {
    if (!completado) {
      // Alta precisión pero quedaron omisiones: aún no se promueve.
      return {
        ...base,
        decision: 'MANTENER_DIFICULTAD',
        nivelNuevo: nivel,
        razon: `Precisión ${precision}% pero la actividad no se completó (hubo omisiones); se mantiene el nivel ${nivel}.`,
      }
    }
    const siguiente = nivelSiguiente(nivel)
    if (siguiente) {
      return {
        ...base,
        decision: 'AUMENTAR_DIFICULTAD',
        nivelNuevo: siguiente,
        razon: `Precisión ${precision}% con la actividad completada; se sube el nivel de ${nivel} a ${siguiente}.`,
      }
    }
    // Ya estaba en el nivel máximo: actividad dominada.
    return {
      ...base,
      decision: 'DESBLOQUEAR_SIGUIENTE_ACTIVIDAD',
      nivelNuevo: nivel,
      nivelSuperado: true,
      razon: `Precisión ${precision}% en el nivel máximo (DIFICIL); se supera la actividad y se desbloquea la siguiente.`,
    }
  }

  // ── Desempeño medio ───────────────────────────────────────
  if (precision >= UMBRALES.MANTENER) {
    return {
      ...base,
      decision: 'MANTENER_DIFICULTAD',
      nivelNuevo: nivel,
      razon: `Precisión ${precision}%; desempeño adecuado, se mantiene el nivel ${nivel}.`,
    }
  }

  // ── Desempeño bajo ────────────────────────────────────────
  if (precision >= UMBRALES.REDUCIR) {
    const previo = nivelPrevio(nivel)
    if (previo) {
      return {
        ...base,
        decision: 'REDUCIR_DIFICULTAD',
        nivelNuevo: previo,
        razon: `Precisión ${precision}%; se reduce el nivel de ${nivel} a ${previo} para reforzar la base.`,
      }
    }
    return {
      ...base,
      decision: 'REPETIR_ACTIVIDAD',
      nivelNuevo: nivel,
      razon: `Precisión ${precision}% en el nivel mínimo (FACIL); se repite la actividad.`,
    }
  }

  // ── Desempeño muy bajo ────────────────────────────────────
  return {
    ...base,
    decision: 'ASIGNAR_REFUERZO',
    nivelNuevo: nivel,
    asignarRefuerzo: true,
    razon: `Precisión ${precision}%; desempeño muy bajo, se asigna un refuerzo de la función ejecutiva.`,
  }
}
