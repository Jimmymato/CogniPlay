import SecuenciasLogicas from './juegos/SecuenciasLogicas'
import CambiaLaRegla from './juegos/CambiaLaRegla'
import EsperaLaSenal from './juegos/EsperaLaSenal'
import MejorCamino from './juegos/MejorCamino'
import CuentaElTiempo from './juegos/CuentaElTiempo'
import DosALaVez from './juegos/DosALaVez'
import RetomaLaTarea from './juegos/RetomaLaTarea'
import JuegoPendiente from './juegos/JuegoPendiente'

// Asocia el nombre de cada actividad (tal como lo define el catálogo del
// backend) con su componente de juego. Cada juego cumple el mismo contrato:
// recibe { configuracion, nivel, color, onTerminar } y llama a onTerminar con
// { respuestasCorrectas, respuestasIncorrectas, omisiones, tiempoSegundos }.
const JUEGOS = {
  'Secuencias Lógicas': SecuenciasLogicas,
  'Cambia la Regla': CambiaLaRegla,
  'Espera la Señal': EsperaLaSenal,
  'Mejor Camino': MejorCamino,
  'Cuenta el Tiempo': CuentaElTiempo,
  'Dos a la Vez': DosALaVez,
  'Retoma la Tarea': RetomaLaTarea,
}

export function obtenerJuego(nombreActividad) {
  return JUEGOS[nombreActividad] ?? JuegoPendiente
}
