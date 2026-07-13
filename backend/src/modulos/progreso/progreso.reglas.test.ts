import { describe, expect, it } from 'vitest'
import {
  UMBRALES,
  ORDEN_NIVELES,
  evaluarProgresion,
  nivelPrevio,
  nivelSiguiente,
} from './progreso.reglas.js'

/**
 * Subfase 6.1 — Pruebas unitarias del motor adaptativo.
 *
 * Cubren todas las reglas de `evaluarProgresion` (lógica pura, sin BD),
 * incluidos los valores frontera de los umbrales 85 / 60 / 40.
 */

describe('nivelSiguiente / nivelPrevio', () => {
  it('recorre el orden FACIL → MEDIO → DIFICIL', () => {
    expect(ORDEN_NIVELES).toEqual(['FACIL', 'MEDIO', 'DIFICIL'])
    expect(nivelSiguiente('FACIL')).toBe('MEDIO')
    expect(nivelSiguiente('MEDIO')).toBe('DIFICIL')
    expect(nivelPrevio('DIFICIL')).toBe('MEDIO')
    expect(nivelPrevio('MEDIO')).toBe('FACIL')
  })

  it('devuelve null en los extremos', () => {
    expect(nivelSiguiente('DIFICIL')).toBeNull()
    expect(nivelPrevio('FACIL')).toBeNull()
  })
})

describe('desempeño alto (precisión ≥ 85, completado)', () => {
  it('sube de FACIL a MEDIO', () => {
    const r = evaluarProgresion({ precision: 90, completado: true, nivel: 'FACIL' })
    expect(r.decision).toBe('AUMENTAR_DIFICULTAD')
    expect(r.nivelAnterior).toBe('FACIL')
    expect(r.nivelNuevo).toBe('MEDIO')
    expect(r.nivelSuperado).toBe(false)
    expect(r.asignarRefuerzo).toBe(false)
  })

  it('sube de MEDIO a DIFICIL', () => {
    const r = evaluarProgresion({ precision: 100, completado: true, nivel: 'MEDIO' })
    expect(r.decision).toBe('AUMENTAR_DIFICULTAD')
    expect(r.nivelNuevo).toBe('DIFICIL')
  })

  it('en DIFICIL supera la actividad y desbloquea la siguiente', () => {
    const r = evaluarProgresion({ precision: 95, completado: true, nivel: 'DIFICIL' })
    expect(r.decision).toBe('DESBLOQUEAR_SIGUIENTE_ACTIVIDAD')
    expect(r.nivelNuevo).toBe('DIFICIL')
    expect(r.nivelSuperado).toBe(true)
  })

  it('frontera: exactamente 85 ya cuenta como desempeño alto', () => {
    const r = evaluarProgresion({ precision: UMBRALES.AUMENTAR, completado: true, nivel: 'FACIL' })
    expect(r.decision).toBe('AUMENTAR_DIFICULTAD')
  })

  it('con omisiones NO se promueve: mantiene el nivel', () => {
    const r = evaluarProgresion({ precision: 92, completado: false, nivel: 'MEDIO' })
    expect(r.decision).toBe('MANTENER_DIFICULTAD')
    expect(r.nivelNuevo).toBe('MEDIO')
    expect(r.nivelSuperado).toBe(false)
  })
})

describe('desempeño medio (60–84): mantiene el nivel', () => {
  it.each([
    ['FACIL', 60],
    ['MEDIO', 72],
    ['DIFICIL', 84],
  ] as const)('en %s con precisión %i', (nivel, precision) => {
    const r = evaluarProgresion({ precision, completado: true, nivel })
    expect(r.decision).toBe('MANTENER_DIFICULTAD')
    expect(r.nivelNuevo).toBe(nivel)
    expect(r.asignarRefuerzo).toBe(false)
  })

  it('frontera: 84 no sube aunque esté completado', () => {
    const r = evaluarProgresion({ precision: 84, completado: true, nivel: 'FACIL' })
    expect(r.decision).toBe('MANTENER_DIFICULTAD')
  })
})

describe('desempeño bajo (40–59): reduce el nivel o repite', () => {
  it('de DIFICIL baja a MEDIO', () => {
    const r = evaluarProgresion({ precision: 50, completado: true, nivel: 'DIFICIL' })
    expect(r.decision).toBe('REDUCIR_DIFICULTAD')
    expect(r.nivelNuevo).toBe('MEDIO')
  })

  it('de MEDIO baja a FACIL', () => {
    const r = evaluarProgresion({ precision: 45, completado: false, nivel: 'MEDIO' })
    expect(r.decision).toBe('REDUCIR_DIFICULTAD')
    expect(r.nivelNuevo).toBe('FACIL')
  })

  it('en FACIL no hay nivel inferior: repite la actividad', () => {
    const r = evaluarProgresion({ precision: 55, completado: true, nivel: 'FACIL' })
    expect(r.decision).toBe('REPETIR_ACTIVIDAD')
    expect(r.nivelNuevo).toBe('FACIL')
  })

  it('frontera: exactamente 40 todavía es reducir/repetir, no refuerzo', () => {
    const r = evaluarProgresion({ precision: UMBRALES.REDUCIR, completado: true, nivel: 'FACIL' })
    expect(r.decision).toBe('REPETIR_ACTIVIDAD')
    expect(r.asignarRefuerzo).toBe(false)
  })

  it('frontera: 59 no llega a mantener', () => {
    const r = evaluarProgresion({ precision: 59, completado: true, nivel: 'MEDIO' })
    expect(r.decision).toBe('REDUCIR_DIFICULTAD')
  })
})

describe('desempeño muy bajo (< 40): asigna refuerzo', () => {
  it.each([
    ['FACIL', 0],
    ['MEDIO', 20],
    ['DIFICIL', 39],
  ] as const)('en %s con precisión %i', (nivel, precision) => {
    const r = evaluarProgresion({ precision, completado: false, nivel })
    expect(r.decision).toBe('ASIGNAR_REFUERZO')
    expect(r.nivelNuevo).toBe(nivel) // el nivel no cambia: se refuerza la función
    expect(r.asignarRefuerzo).toBe(true)
    expect(r.nivelSuperado).toBe(false)
  })
})

describe('contrato del resultado', () => {
  it('siempre informa nivelAnterior y una razón legible', () => {
    for (const nivel of ORDEN_NIVELES) {
      for (const precision of [0, 40, 59, 60, 84, 85, 100]) {
        const r = evaluarProgresion({ precision, completado: true, nivel })
        expect(r.nivelAnterior).toBe(nivel)
        expect(r.razon.length).toBeGreaterThan(10)
      }
    }
  })
})
