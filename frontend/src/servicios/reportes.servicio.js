import clienteApi from './clienteApi'

// Reportes de evolución por niño (solo terapeuta). El backend agrega los
// datos; aquí solo se consulta con el periodo elegido (instantes ISO).

// Resumen del periodo: totales, desglose por función ejecutiva, áreas
// destacadas y resumen en lenguaje de apoyo.
export async function obtenerResumenReporte(ninoId, { desde, hasta } = {}) {
  const { data } = await clienteApi.get('/reportes/resumen', {
    params: { ninoId, desde, hasta },
  })
  return data
}

// Historial de intentos del periodo en orden cronológico (alimenta los
// gráficos de evolución).
export async function obtenerHistorialReporte(ninoId, { desde, hasta } = {}) {
  const { data } = await clienteApi.get('/reportes/historial', {
    params: { ninoId, desde, hasta },
  })
  return data
}

// Descarga el reporte como archivo (formato: 'pdf' | 'xlsx'). Se pide como
// blob por el cliente Axios para que el token viaje en el interceptor, y se
// dispara la descarga con un enlace temporal.
export async function descargarReporte(ninoId, { desde, hasta } = {}, formato) {
  const respuesta = await clienteApi.get('/reportes/exportar', {
    params: { ninoId, desde, hasta, formato },
    responseType: 'blob',
  })

  // Nombre sugerido por el backend en Content-Disposition; si no llega,
  // se arma uno local equivalente.
  const disposicion = respuesta.headers['content-disposition'] ?? ''
  const coincidencia = disposicion.match(/filename="([^"]+)"/)
  const nombreArchivo =
    coincidencia?.[1] ?? `reporte-${new Date().toISOString().slice(0, 10)}.${formato}`

  const url = URL.createObjectURL(respuesta.data)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}
