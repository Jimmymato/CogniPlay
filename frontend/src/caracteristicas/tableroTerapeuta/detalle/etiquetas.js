// Etiquetas legibles y utilidades de formato compartidas por la vista
// individual del niño.

export const NIVELES = ['FACIL', 'MEDIO', 'DIFICIL']

export const ETIQUETA_NIVEL = {
  FACIL: 'Fácil',
  MEDIO: 'Medio',
  DIFICIL: 'Difícil',
}

const ETIQUETA_DECISION = {
  AUMENTAR_DIFICULTAD: 'Subió de nivel',
  MANTENER_DIFICULTAD: 'Mantiene el nivel',
  REDUCIR_DIFICULTAD: 'Bajó de nivel',
  REPETIR_ACTIVIDAD: 'Repite la actividad',
  ASIGNAR_REFUERZO: 'Refuerzo asignado',
  DESBLOQUEAR_SIGUIENTE_NIVEL: 'Desbloquea el siguiente nivel',
  DESBLOQUEAR_SIGUIENTE_ACTIVIDAD: 'Actividad superada',
  BLOQUEAR_ACTIVIDAD: 'Actividad bloqueada',
  DESBLOQUEAR_ACTIVIDAD: 'Actividad desbloqueada',
}

// Con fallback al valor crudo para tipos de decisión desconocidos.
export function etiquetaDecision(decision) {
  return ETIQUETA_DECISION[decision] ?? decision
}

// Fecha corta legible (ej. "2 jul 2026").
export function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Fecha y hora cortas (ej. "2 jul, 09:41 p. m.").
export function formatearFechaHora(iso) {
  return new Date(iso).toLocaleString('es-PE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Edad en años a partir de la fecha de nacimiento.
export function calcularEdad(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento)
  if (Number.isNaN(nacimiento.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1
  return edad
}
