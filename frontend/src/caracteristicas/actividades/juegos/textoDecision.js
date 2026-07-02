import {
  PartyPopper,
  Trophy,
  Dumbbell,
  Smile,
  RotateCcw,
  HeartHandshake,
  CircleCheck,
} from 'lucide-react'

// Traduce la decisión del motor adaptativo a un mensaje positivo y sencillo
// para el niño. El tono es siempre alentador (nunca punitivo). `icono` es un
// componente de lucide-react que la pantalla de resultado monta al tamaño
// que necesite.
const MENSAJES = {
  AUMENTAR_DIFICULTAD: { icono: PartyPopper, titulo: '¡Excelente!', texto: 'Subes de nivel.' },
  DESBLOQUEAR_SIGUIENTE_ACTIVIDAD: {
    icono: Trophy,
    titulo: '¡Lo lograste!',
    texto: 'Dominaste esta actividad.',
  },
  MANTENER_DIFICULTAD: { icono: Dumbbell, titulo: '¡Muy bien!', texto: 'Sigue practicando así.' },
  REDUCIR_DIFICULTAD: {
    icono: Smile,
    titulo: '¡Buen intento!',
    texto: 'Vamos a practicar un poco más fácil.',
  },
  REPETIR_ACTIVIDAD: { icono: RotateCcw, titulo: '¡Tú puedes!', texto: 'Inténtalo otra vez.' },
  ASIGNAR_REFUERZO: {
    icono: HeartHandshake,
    titulo: '¡Buen esfuerzo!',
    texto: 'Tu terapeuta te ayudará con esto.',
  },
}

const POR_DEFECTO = { icono: CircleCheck, titulo: '¡Terminaste!', texto: 'Buen trabajo.' }

export function mensajeDecision(decision) {
  return MENSAJES[decision] ?? POR_DEFECTO
}
