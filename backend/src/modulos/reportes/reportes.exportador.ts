import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'
import type {
  obtenerHistorialReporte,
  obtenerResumenReporte,
} from './reportes.servicio'

/**
 * Exportadores del módulo de reportes: generan el documento PDF/XLSX en
 * memoria a partir del resumen y el historial ya calculados por el servicio
 * (sin acceso a BD, misma separación que las reglas puras). Así el archivo
 * exportado siempre coincide con lo que el terapeuta ve en pantalla.
 */

export type ResumenReporte = Awaited<ReturnType<typeof obtenerResumenReporte>>
export type HistorialReporte = Awaited<ReturnType<typeof obtenerHistorialReporte>>

// Etiquetas legibles para los valores de enum que llegan del servicio.
const ETIQUETAS_NIVEL: Record<string, string> = {
  FACIL: 'Fácil',
  MEDIO: 'Medio',
  DIFICIL: 'Difícil',
}

const ETIQUETAS_DECISION: Record<string, string> = {
  AUMENTAR_DIFICULTAD: 'Aumentar dificultad',
  MANTENER_DIFICULTAD: 'Mantener dificultad',
  REDUCIR_DIFICULTAD: 'Reducir dificultad',
  REPETIR_ACTIVIDAD: 'Repetir actividad',
  ASIGNAR_REFUERZO: 'Refuerzo asignado',
  DESBLOQUEAR_SIGUIENTE_ACTIVIDAD: 'Actividad superada',
  BLOQUEAR_ACTIVIDAD: 'Bloqueo manual',
  DESBLOQUEAR_ACTIVIDAD: 'Desbloqueo manual',
}

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  FUERTE: 'Fuerte',
  ADECUADO: 'Adecuado',
  IRREGULAR: 'Irregular',
  NECESITA_REFUERZO: 'Necesita refuerzo',
}

const formatearFecha = (valor: Date | string) =>
  new Date(valor).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const formatearFechaHora = (valor: Date | string) =>
  new Date(valor).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** Texto del periodo del reporte ("01/06/2026 – 30/06/2026", o abierto). */
function textoPeriodo(periodo: ResumenReporte['periodo']) {
  if (!periodo.desde && !periodo.hasta) return 'Todo el historial'
  const desde = periodo.desde ? formatearFecha(periodo.desde) : 'inicio'
  const hasta = periodo.hasta ? formatearFecha(periodo.hasta) : 'hoy'
  return `${desde} – ${hasta}`
}

/** Nombre de archivo seguro: sin tildes ni caracteres fuera de [a-z0-9-]. */
export function nombreArchivoReporte(resumen: ResumenReporte, extension: string) {
  const nombre = `${resumen.nino?.nombres ?? ''} ${resumen.nino?.apellidos ?? ''}`
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const fecha = new Date().toISOString().slice(0, 10)
  return `reporte-${nombre || 'nino'}-${fecha}.${extension}`
}

// ─────────────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────────────

const AZUL = '#1d4ed8'
const GRIS_TEXTO = '#374151'
const GRIS_SUAVE = '#6b7280'
const BORDE = '#e5e7eb'

export function generarPdfReporte(
  resumen: ResumenReporte,
  historial: HistorialReporte,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true })
    const trozos: Buffer[] = []
    doc.on('data', (trozo: Buffer) => trozos.push(trozo))
    doc.on('end', () => resolve(Buffer.concat(trozos)))
    doc.on('error', reject)

    const anchoUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right

    // Salta de página si no queda espacio vertical suficiente.
    const asegurarEspacio = (alto: number) => {
      if (doc.y + alto > doc.page.height - doc.page.margins.bottom) doc.addPage()
    }

    const tituloSeccion = (texto: string) => {
      asegurarEspacio(40)
      doc.moveDown(1)
      doc.font('Helvetica-Bold').fontSize(13).fillColor(AZUL).text(texto)
      doc.moveDown(0.4)
      doc.font('Helvetica').fontSize(10).fillColor(GRIS_TEXTO)
    }

    // ── Encabezado ──
    doc.font('Helvetica-Bold').fontSize(20).fillColor(AZUL).text('CogniPlay')
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor(GRIS_TEXTO)
      .text('Reporte de evolución del desempeño')
    doc.moveDown(0.8)
    doc.fontSize(10).fillColor(GRIS_TEXTO)
    doc
      .font('Helvetica-Bold')
      .text(`Niño: ${resumen.nino?.nombres ?? ''} ${resumen.nino?.apellidos ?? ''}`)
    doc.font('Helvetica')
    doc.text(`Periodo: ${textoPeriodo(resumen.periodo)}`)
    doc.text(`Generado el: ${formatearFechaHora(new Date())}`)
    doc.moveDown(0.6)
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.margins.left + anchoUtil, doc.y)
      .strokeColor(BORDE)
      .stroke()

    // ── Resumen del periodo ──
    tituloSeccion('Resumen del periodo')
    const t = resumen.totales
    const lineasResumen = [
      `Intentos registrados: ${t.intentos} (${t.intentosCompletados} completados)`,
      `Actividades jugadas: ${t.actividadesJugadas}`,
      `Precisión promedio: ${t.precisionPromedio} %`,
      `Puntaje promedio: ${t.puntajePromedio}`,
      `Tiempo de práctica: ${Math.round(t.tiempoTotalSegundos / 60)} minutos`,
      `Actividades superadas (estado actual): ${t.actividadesSuperadas}`,
      `Refuerzos del periodo: ${t.refuerzosAsignados} asignados, ${t.refuerzosPendientes} pendientes, ${t.refuerzosCompletados} completados`,
    ]
    for (const linea of lineasResumen) doc.text(`•  ${linea}`)

    // ── Desglose por función ejecutiva ──
    tituloSeccion('Desglose por función ejecutiva')
    const columnasFuncion = [
      { titulo: 'Función ejecutiva', ancho: 0.34 },
      { titulo: 'Intentos', ancho: 0.12 },
      { titulo: 'Precisión prom.', ancho: 0.18 },
      { titulo: 'Puntaje prom.', ancho: 0.16 },
      { titulo: 'Categoría', ancho: 0.2 },
    ]
    const filasFuncion = resumen.porFuncion.map((f) => [
      f.etiqueta,
      String(f.intentos),
      f.intentos > 0 ? `${f.precisionPromedio} %` : '—',
      f.intentos > 0 ? String(f.puntajePromedio) : '—',
      f.categoria ? ETIQUETAS_CATEGORIA[f.categoria] : 'Sin datos',
    ])
    dibujarTabla(doc, anchoUtil, columnasFuncion, filasFuncion, asegurarEspacio)

    // ── Áreas destacadas ──
    tituloSeccion('Áreas destacadas')
    const fuertes = resumen.areasFuertes.map((a) => a.etiqueta).join(', ')
    const refuerzo = resumen.areasRefuerzo.map((a) => a.etiqueta).join(', ')
    doc.text(`Mejor desempeño: ${fuertes || 'sin áreas destacadas en el periodo'}`)
    doc.text(`Requieren refuerzo: ${refuerzo || 'ninguna en el periodo'}`)

    // ── Resumen de apoyo ──
    tituloSeccion('Resumen en lenguaje de apoyo')
    for (const frase of resumen.resumenApoyo) {
      asegurarEspacio(30)
      doc.text(`•  ${frase}`, { width: anchoUtil })
    }

    // ── Historial de intentos ──
    tituloSeccion(`Historial de intentos (${historial.length})`)
    if (historial.length === 0) {
      doc.fillColor(GRIS_SUAVE).text('Sin intentos en el periodo seleccionado.')
    } else {
      const columnasIntento = [
        { titulo: 'Fecha', ancho: 0.17 },
        { titulo: 'Actividad', ancho: 0.23 },
        { titulo: 'Función', ancho: 0.2 },
        { titulo: 'Nivel', ancho: 0.08 },
        { titulo: 'Precisión', ancho: 0.1 },
        { titulo: 'Decisión', ancho: 0.22 },
      ]
      const filasIntento = historial.map((intento) => [
        formatearFechaHora(intento.creadoEn),
        intento.actividad.nombre,
        intento.actividad.funcionEjecutiva.etiqueta,
        ETIQUETAS_NIVEL[intento.nivel] ?? intento.nivel,
        `${Number(intento.precision)} %`,
        intento.decision ? ETIQUETAS_DECISION[intento.decision.decision] ?? '' : '—',
      ])
      dibujarTabla(doc, anchoUtil, columnasIntento, filasIntento, asegurarEspacio)
    }

    // ── Pie de página con numeración ──
    const paginas = doc.bufferedPageRange()
    for (let i = paginas.start; i < paginas.start + paginas.count; i += 1) {
      doc.switchToPage(i)
      // Sin este ajuste, escribir bajo el margen inferior crea páginas nuevas.
      const margenInferior = doc.page.margins.bottom
      doc.page.margins.bottom = 0
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(GRIS_SUAVE)
        .text(
          `CogniPlay — uso interno del terapeuta. No constituye un diagnóstico clínico.  ·  Página ${i + 1} de ${paginas.count}`,
          doc.page.margins.left,
          doc.page.height - margenInferior + 12,
          { width: anchoUtil, align: 'center', lineBreak: false },
        )
      doc.page.margins.bottom = margenInferior
    }

    doc.end()
  })
}

interface ColumnaTabla {
  titulo: string
  ancho: number // fracción del ancho útil (las fracciones suman 1)
}

/** Tabla sencilla con encabezado repetido al saltar de página. */
function dibujarTabla(
  doc: PDFKit.PDFDocument,
  anchoUtil: number,
  columnas: ColumnaTabla[],
  filas: string[][],
  asegurarEspacio: (alto: number) => void,
) {
  const xInicio = doc.page.margins.left
  const anchos = columnas.map((c) => c.ancho * anchoUtil)

  // Cada celda ocupa exactamente una línea: lo que no cabe se corta con «…»
  // (si se dejara envolver, la segunda línea se encimaría con la fila
  // siguiente porque el avance vertical es fijo).
  const opcionesCelda = (ancho: number) => ({
    width: ancho - 6,
    height: 11,
    ellipsis: true,
  })

  const dibujarEncabezado = () => {
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GRIS_TEXTO)
    let x = xInicio
    const y = doc.y
    columnas.forEach((columna, i) => {
      doc.text(columna.titulo, x, y, opcionesCelda(anchos[i]))
      x += anchos[i]
    })
    doc.y = y + 14
    doc
      .moveTo(xInicio, doc.y - 3)
      .lineTo(xInicio + anchoUtil, doc.y - 3)
      .strokeColor(BORDE)
      .stroke()
    doc.font('Helvetica').fontSize(9).fillColor(GRIS_TEXTO)
  }

  asegurarEspacio(60)
  dibujarEncabezado()

  for (const fila of filas) {
    if (doc.y + 16 > doc.page.height - doc.page.margins.bottom) {
      doc.addPage()
      dibujarEncabezado()
    }
    let x = xInicio
    const y = doc.y
    fila.forEach((celda, i) => {
      doc.text(celda, x, y, opcionesCelda(anchos[i]))
      x += anchos[i]
    })
    doc.y = y + 14
  }
  // Restablece el cursor al margen para el contenido que siga.
  doc.x = xInicio
}

// ─────────────────────────────────────────────────────────────
// Excel
// ─────────────────────────────────────────────────────────────

export async function generarExcelReporte(
  resumen: ResumenReporte,
  historial: HistorialReporte,
): Promise<Buffer> {
  const libro = new ExcelJS.Workbook()
  libro.creator = 'CogniPlay'
  libro.created = new Date()

  // ── Hoja 1: Resumen ──
  const hojaResumen = libro.addWorksheet('Resumen')
  hojaResumen.columns = [
    { width: 34 },
    { width: 16 },
    { width: 18 },
    { width: 16 },
    { width: 20 },
  ]

  const agregarTitulo = (texto: string) => {
    const fila = hojaResumen.addRow([texto])
    fila.font = { bold: true, size: 12, color: { argb: 'FF1D4ED8' } }
    return fila
  }

  agregarTitulo('CogniPlay — Reporte de evolución del desempeño')
  hojaResumen.addRow([
    'Niño',
    `${resumen.nino?.nombres ?? ''} ${resumen.nino?.apellidos ?? ''}`,
  ])
  hojaResumen.addRow(['Periodo', textoPeriodo(resumen.periodo)])
  hojaResumen.addRow(['Generado el', formatearFechaHora(new Date())])
  hojaResumen.addRow([])

  agregarTitulo('Resumen del periodo')
  const t = resumen.totales
  const parejas: [string, number | string][] = [
    ['Intentos registrados', t.intentos],
    ['Intentos completados', t.intentosCompletados],
    ['Actividades jugadas', t.actividadesJugadas],
    ['Precisión promedio (%)', t.precisionPromedio],
    ['Puntaje promedio', t.puntajePromedio],
    ['Tiempo de práctica (minutos)', Math.round(t.tiempoTotalSegundos / 60)],
    ['Actividades superadas (estado actual)', t.actividadesSuperadas],
    ['Refuerzos asignados en el periodo', t.refuerzosAsignados],
    ['Refuerzos pendientes', t.refuerzosPendientes],
    ['Refuerzos completados', t.refuerzosCompletados],
  ]
  for (const [etiqueta, valor] of parejas) hojaResumen.addRow([etiqueta, valor])
  hojaResumen.addRow([])

  agregarTitulo('Desglose por función ejecutiva')
  const encabezadoFunciones = hojaResumen.addRow([
    'Función ejecutiva',
    'Intentos',
    'Precisión promedio (%)',
    'Puntaje promedio',
    'Categoría',
  ])
  encabezadoFunciones.font = { bold: true }
  for (const f of resumen.porFuncion) {
    hojaResumen.addRow([
      f.etiqueta,
      f.intentos,
      f.intentos > 0 ? f.precisionPromedio : null,
      f.intentos > 0 ? f.puntajePromedio : null,
      f.categoria ? ETIQUETAS_CATEGORIA[f.categoria] : 'Sin datos',
    ])
  }
  hojaResumen.addRow([])

  agregarTitulo('Resumen en lenguaje de apoyo')
  for (const frase of resumen.resumenApoyo) {
    const fila = hojaResumen.addRow([frase])
    hojaResumen.mergeCells(fila.number, 1, fila.number, 5)
    fila.alignment = { wrapText: true, vertical: 'top' }
  }

  // ── Hoja 2: Historial de intentos ──
  const hojaHistorial = libro.addWorksheet('Historial')
  hojaHistorial.columns = [
    { header: 'Fecha', key: 'fecha', width: 18 },
    { header: 'Actividad', key: 'actividad', width: 26 },
    { header: 'Función ejecutiva', key: 'funcion', width: 24 },
    { header: 'Nivel', key: 'nivel', width: 10 },
    { header: 'Precisión (%)', key: 'precision', width: 13 },
    { header: 'Puntaje', key: 'puntaje', width: 10 },
    { header: 'Completado', key: 'completado', width: 12 },
    { header: 'Tiempo (s)', key: 'tiempo', width: 11 },
    { header: 'Decisión del motor', key: 'decision', width: 24 },
  ]
  hojaHistorial.getRow(1).font = { bold: true }
  hojaHistorial.views = [{ state: 'frozen', ySplit: 1 }]
  for (const intento of historial) {
    hojaHistorial.addRow({
      fecha: formatearFechaHora(intento.creadoEn),
      actividad: intento.actividad.nombre,
      funcion: intento.actividad.funcionEjecutiva.etiqueta,
      nivel: ETIQUETAS_NIVEL[intento.nivel] ?? intento.nivel,
      precision: Number(intento.precision),
      puntaje: intento.puntaje,
      completado: intento.completado ? 'Sí' : 'No',
      tiempo: intento.tiempoSegundos,
      decision: intento.decision
        ? ETIQUETAS_DECISION[intento.decision.decision] ?? intento.decision.decision
        : '—',
    })
  }

  const contenido = await libro.xlsx.writeBuffer()
  return Buffer.from(contenido as ArrayBuffer)
}
