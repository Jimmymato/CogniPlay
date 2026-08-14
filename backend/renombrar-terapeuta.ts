// Script temporal: renombra la terapeuta seed "Ana García" → "Alex Zambrano"
// (terapeuta real del centro) y desactiva el perfil de prueba "alex zambrano".
// Sin argumentos solo muestra lo que haría; con --aplicar ejecuta los cambios.
// Uso: $env:DATABASE_URL="<cadena de Neon>" ; npx tsx renombrar-terapeuta.ts --aplicar
import { prisma } from './src/config/prisma'

const aplicar = process.argv.includes('--aplicar')

const terapeuta = await prisma.terapeuta.findFirst({
  where: { usuario: { correo: 'terapeuta@test.com' } },
  include: { usuario: { select: { correo: true } } },
})

if (!terapeuta) {
  console.error('No se encontró el usuario terapeuta@test.com en esta base.')
  process.exit(1)
}

console.log(`Terapeuta actual: ${terapeuta.nombres} ${terapeuta.apellidos} (${terapeuta.usuario.correo})`)

const perfilesPrueba = await prisma.nino.findMany({
  where: {
    nombres: { contains: 'alex', mode: 'insensitive' },
    apellidos: { contains: 'zambrano', mode: 'insensitive' },
  },
  include: {
    usuario: { select: { id: true, correo: true, activo: true } },
    _count: { select: { intentos: true } },
  },
})

for (const nino of perfilesPrueba) {
  console.log(
    `Perfil de prueba encontrado: ${nino.nombres} ${nino.apellidos} (${nino.usuario.correo}) | ` +
    `activo: ${nino.activo} | intentos: ${nino._count.intentos}`
  )
}
if (perfilesPrueba.length === 0) {
  console.log('No hay perfiles de niño "alex zambrano" en esta base.')
}

if (!aplicar) {
  console.log('\nVista previa: no se cambió nada. Ejecuta con --aplicar para aplicar los cambios.')
  await prisma.$disconnect()
  process.exit(0)
}

await prisma.terapeuta.update({
  where: { id: terapeuta.id },
  data: { nombres: 'Alex', apellidos: 'Zambrano' },
})
console.log('\nTerapeuta renombrada a: Alex Zambrano')

for (const nino of perfilesPrueba) {
  await prisma.nino.update({ where: { id: nino.id }, data: { activo: false } })
  await prisma.usuario.update({ where: { id: nino.usuario.id }, data: { activo: false } })
  console.log(`Perfil de prueba desactivado: ${nino.nombres} ${nino.apellidos} (${nino.usuario.correo})`)
}

console.log('Listo.')
await prisma.$disconnect()
