// Utilidades aleatorias compartidas por los juegos.

// Entero entre min y max, ambos incluidos.
export const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// Devuelve una copia barajada (Fisher–Yates) sin mutar la lista original.
export function barajar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = entero(0, i)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Un elemento al azar de la lista.
export const elementoAleatorio = (lista) => lista[entero(0, lista.length - 1)]

// Un elemento al azar distinto del valor dado.
export function elegirDistinto(lista, valor) {
  const candidatos = lista.filter((x) => x !== valor)
  return elementoAleatorio(candidatos)
}
