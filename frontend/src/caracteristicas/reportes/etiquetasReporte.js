// Textos y colores de las categorías de desempeño que entrega el backend
// en el reporte (alineadas con los umbrales del motor adaptativo).

export const CATEGORIAS = {
  FUERTE: {
    texto: 'Fortalecida',
    color: 'var(--cp-green-text)',
    fondo: 'var(--cp-green-bg)',
    borde: 'var(--cp-green-border)',
  },
  ADECUADO: {
    texto: 'Adecuado',
    color: 'var(--cp-blue-dark)',
    fondo: 'var(--cp-blue-light)',
    borde: 'var(--cp-border)',
  },
  IRREGULAR: {
    texto: 'Irregular',
    color: 'var(--cp-amber-text)',
    fondo: 'var(--cp-amber-bg)',
    borde: 'var(--cp-amber-border)',
  },
  NECESITA_REFUERZO: {
    texto: 'Necesita refuerzo',
    color: 'var(--cp-red-text)',
    fondo: 'var(--cp-red-bg)',
    borde: 'var(--cp-red-border)',
  },
}

export const CATEGORIA_SIN_DATOS = {
  texto: 'Sin datos',
  color: 'var(--cp-text-3)',
  fondo: 'var(--cp-surface-2)',
  borde: 'var(--cp-border)',
}

export function categoriaDeFuncion(categoria) {
  return CATEGORIAS[categoria] ?? CATEGORIA_SIN_DATOS
}
