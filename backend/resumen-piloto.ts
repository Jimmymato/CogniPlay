// Script temporal de SOLO LECTURA: resume los intentos registrados en el piloto.
// Uso: $env:DATABASE_URL="<cadena de Neon>" ; npx tsx resumen-piloto.ts
import { prisma } from './src/config/prisma'

const DESDE = new Date('2026-07-13T00:00:00-05:00')

function fechaLocal(d: Date) {
  return d.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })
}

const ninos = await prisma.nino.findMany({
  include: { usuario: { select: { correo: true } }, terapeuta: { select: { nombres: true, apellidos: true } } },
  orderBy: { creadoEn: 'asc' },
})

console.log(`Niños registrados en total: ${ninos.length}\n`)

for (const nino of ninos) {
  const intentos = await prisma.intento.findMany({
    where: { ninoId: nino.id, creadoEn: { gte: DESDE } },
    orderBy: { creadoEn: 'asc' },
    include: {
      actividad: { select: { nombre: true } },
      decision: { select: { decision: true } },
    },
  })

  if (intentos.length === 0) continue

  console.log('='.repeat(70))
  console.log(`${nino.nombres} ${nino.apellidos}  (${nino.usuario.correo})`)
  console.log(`Terapeuta: ${nino.terapeuta.nombres} ${nino.terapeuta.apellidos}`)
  console.log(`Intentos desde el 13-jul: ${intentos.length}`)
  console.log('-'.repeat(70))

  let sumaPrecision = 0
  const actividades = new Set<string>()
  for (const i of intentos) {
    actividades.add(i.actividad.nombre)
    sumaPrecision += Number(i.precision)
    console.log(
      `${fechaLocal(i.creadoEn)} | ${i.actividad.nombre} | ${i.nivel} | ` +
      `${i.respuestasCorrectas}✓ ${i.respuestasIncorrectas}✗ ${i.omisiones}∅ de ${i.totalItems} | ` +
      `precisión ${Number(i.precision).toFixed(1)}% | ${i.tiempoSegundos}s | puntaje ${i.puntaje} | ` +
      `decisión: ${i.decision?.decision ?? '—'}`
    )
  }
  console.log('-'.repeat(70))
  console.log(`Actividades distintas: ${actividades.size} → ${[...actividades].join(', ')}`)
  console.log(`Precisión promedio: ${(sumaPrecision / intentos.length).toFixed(1)}%`)

  const refuerzos = await prisma.refuerzo.findMany({
    where: { ninoId: nino.id, creadoEn: { gte: DESDE } },
    include: { funcionEjecutiva: { select: { etiqueta: true } } },
  })
  if (refuerzos.length > 0) {
    console.log(`Refuerzos generados: ${refuerzos.map(r => `${r.funcionEjecutiva.etiqueta} (${r.estado})`).join(', ')}`)
  }
  console.log()
}

await prisma.$disconnect()
