import {
  Puzzle,
  RefreshCw,
  Hand,
  Route,
  Timer,
  Layers,
  Sprout,
  Gamepad2,
} from 'lucide-react'

// La BD guarda el ícono de cada actividad como un nombre de lucide-react
// (campo `Actividad.icono`, ver prisma/seed.ts). Este registro lo traduce al
// componente; un nombre desconocido cae en el ícono genérico de juego.
const REGISTRO = {
  puzzle: Puzzle,
  'refresh-cw': RefreshCw,
  hand: Hand,
  route: Route,
  timer: Timer,
  layers: Layers,
  sprout: Sprout,
}

export default function IconoActividad({ nombre, size = 20, color = 'currentColor', ...resto }) {
  const Icono = REGISTRO[nombre] ?? Gamepad2
  return (
    <Icono
      size={size}
      color={color}
      aria-hidden="true"
      style={{ verticalAlign: 'text-bottom', flexShrink: 0 }}
      {...resto}
    />
  )
}
