import { useMemo, useState } from 'react'
import CabeceraJuego from '../componentes/CabeceraJuego'
import Figura from '../componentes/Figura'
import { useJuegoRondas } from './useJuegoRondas'
import { elementoAleatorio, barajar } from './aleatorio'
import {
  estiloJuegoRaiz,
  estiloZonaJuego,
  estiloInstruccion,
  estiloPista,
  estiloOpcion,
} from './estilosJuego'

// Secuencias visuales de patrones: cada letra del patrón es un dibujo (forma +
// color) y la fila repite el patrón; el niño elige el dibujo que sigue. Es
// razonamiento sin aritmética, apropiado para el público del sistema.
const PATRONES = {
  FACIL: ['AB'],
  MEDIO: ['ABC'],
  DIFICIL: ['AAB', 'ABB', 'ABC'],
}

const FORMAS = ['circulo', 'cuadrado', 'triangulo']
// Colores apagados (público TEA), pero bien distinguibles entre sí.
const COLORES = ['#C05A52', '#2F72CE', '#3E9668', '#D49A14']

// Cantidad de dibujos visibles antes del hueco: alcanza para ver el patrón
// repetirse al menos dos veces con cualquiera de los patrones definidos.
const VISIBLES = 5

// Crea una ronda: asigna un dibujo distinto a cada letra del patrón, arma los
// cinco visibles, la respuesta (el que sigue) y las opciones con un distractor
// que no pertenece al patrón.
function crearRonda(nivel) {
  const patron = elementoAleatorio(PATRONES[nivel] ?? PATRONES.FACIL)
  const letras = [...new Set(patron)]
  const formas = barajar(FORMAS)
  const colores = barajar(COLORES)

  const porLetra = {}
  letras.forEach((letra, i) => {
    porLetra[letra] = { forma: formas[i], color: colores[i], clave: `${formas[i]}|${colores[i]}` }
  })

  const dibujoEn = (i) => porLetra[patron[i % patron.length]]
  const visibles = Array.from({ length: VISIBLES }, (_, i) => dibujoEn(i))
  const respuesta = dibujoEn(VISIBLES)

  // Distractor con forma o color aún sin usar, para que nunca se confunda con
  // los dibujos del patrón.
  const n = letras.length
  const distractor =
    n < FORMAS.length
      ? { forma: formas[n], color: colores[n], clave: `${formas[n]}|${colores[n]}` }
      : { forma: formas[0], color: colores[n], clave: `${formas[0]}|${colores[n]}` }

  const opciones = barajar([...letras.map((l) => porLetra[l]), distractor])
  return { visibles, respuesta, opciones }
}

export default function SecuenciasLogicas({ configuracion, nivel, color, onTerminar }) {
  const { items, tiempoLimiteSegundos, pistas } = configuracion
  const rondas = useMemo(
    () => Array.from({ length: items }, () => crearRonda(nivel)),
    [items, nivel],
  )
  const [elegida, setElegida] = useState(null)

  const { indice, restante, bloqueado, registrar } = useJuegoRondas({
    items,
    tiempoLimiteSegundos,
    onTerminar,
  })

  const ronda = rondas[indice]

  function responder(opcion) {
    if (bloqueado) return
    setElegida(opcion.clave)
    registrar(opcion.clave === ronda.respuesta.clave, () => setElegida(null))
  }

  function estadoOpcion(opcion) {
    if (elegida === null) return null
    if (opcion.clave === ronda.respuesta.clave) return 'correcta'
    if (opcion.clave === elegida) return 'incorrecta'
    return null
  }

  const celda = {
    width: 'clamp(64px, 9vw, 150px)',
    height: 'clamp(64px, 9vw, 150px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--r-md)',
  }

  return (
    <div style={estiloJuegoRaiz}>
      <CabeceraJuego
        titulo="Secuencias Lógicas"
        color={color}
        indice={indice}
        total={items}
        segundosRestantes={restante}
        segundosTotales={tiempoLimiteSegundos}
      />

      <div style={estiloZonaJuego}>
        <p style={estiloInstruccion}>¿Qué dibujo sigue en la secuencia?</p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'clamp(8px, 1.5vw, 24px)',
            marginBottom: 16,
          }}
        >
          {ronda.visibles.map((dibujo, i) => (
            <span
              key={i}
              style={{
                ...celda,
                background: 'var(--cp-surface)',
                border: '1px solid var(--cp-border)',
              }}
            >
              <Figura forma={dibujo.forma} color={dibujo.color} tam="clamp(46px, 6.5vw, 112px)" />
            </span>
          ))}
          <span
            style={{
              ...celda,
              color,
              background: `color-mix(in srgb, ${color} 12%, white)`,
              border: `2px dashed ${color}`,
              fontSize: 'clamp(34px, 4.5vw, 68px)',
              fontWeight: 700,
            }}
          >
            ?
          </span>
        </div>

        {pistas && (
          <p style={estiloPista}>
            Pista: los dibujos se repiten siempre en el mismo orden. Mira cómo empieza.
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${ronda.opciones.length}, 1fr)`,
            gap: 'clamp(14px, 1.6vw, 22px)',
            marginTop: 14,
            width: '100%',
            maxWidth: ronda.opciones.length > 3 ? 900 : 720,
            marginInline: 'auto',
          }}
        >
          {ronda.opciones.map((opcion, i) => (
            <button
              key={opcion.clave}
              type="button"
              onClick={() => responder(opcion)}
              disabled={bloqueado}
              aria-label={`Opción ${i + 1}: ${opcion.forma}`}
              style={estiloOpcion(estadoOpcion(opcion), bloqueado, {
                display: 'flex',
                justifyContent: 'center',
                padding: 16,
              })}
            >
              <Figura forma={opcion.forma} color={opcion.color} tam="clamp(52px, 7vw, 112px)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
