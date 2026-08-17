import { NivelDificultad, Prisma, RolUsuario } from '@prisma/client'
import type { NombreFuncionEjecutiva } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/config/prisma'

interface DefNivel {
  nivel: NivelDificultad
  configuracion: Prisma.InputJsonObject
  totalItems: number
  puntajeMaximo: number
}

interface DefFuncion {
  nombre: NombreFuncionEjecutiva
  etiqueta: string
  descripcion: string
  color: string
  orden: number
  actividad: { nombre: string; descripcion: string; icono: string }
}

// Configuración estándar de los tres niveles de cada actividad.
const niveles = (base: number): DefNivel[] => [
  {
    nivel: NivelDificultad.FACIL,
    configuracion: { items: base, tiempoLimiteSegundos: 60, pistas: true },
    totalItems: base,
    puntajeMaximo: base * 10,
  },
  {
    nivel: NivelDificultad.MEDIO,
    configuracion: { items: base + 3, tiempoLimiteSegundos: 45, pistas: false },
    totalItems: base + 3,
    puntajeMaximo: (base + 3) * 10,
  },
  {
    nivel: NivelDificultad.DIFICIL,
    configuracion: { items: base + 5, tiempoLimiteSegundos: 30, pistas: false },
    totalItems: base + 5,
    puntajeMaximo: (base + 5) * 10,
  },
]

const FUNCIONES: DefFuncion[] = [
  {
    nombre: 'RAZONAMIENTO',
    etiqueta: 'Razonamiento',
    descripcion: 'Resolver problemas identificando patrones y relaciones lógicas.',
    color: '#5C68C4',
    orden: 1,
    actividad: { nombre: 'Secuencias Lógicas', descripcion: 'Completa la secuencia que falta.', icono: 'puzzle' },
  },
  {
    nombre: 'FLEXIBILIDAD_COGNITIVA',
    etiqueta: 'Flexibilidad Cognitiva',
    descripcion: 'Cambiar de estrategia o regla según la situación.',
    color: '#3E9668',
    orden: 2,
    actividad: { nombre: 'Cambia la Regla', descripcion: 'Clasifica según la regla que cambia.', icono: 'refresh-cw' },
  },
  {
    nombre: 'INHIBICION',
    etiqueta: 'Inhibición',
    descripcion: 'Controlar impulsos y evitar respuestas automáticas.',
    color: '#9E4038',
    orden: 3,
    actividad: { nombre: 'Espera la Señal', descripcion: 'Toca solo cuando la señal sea verde.', icono: 'hand' },
  },
  {
    nombre: 'TOMA_DECISIONES',
    etiqueta: 'Toma de Decisiones',
    descripcion: 'Elegir la mejor opción evaluando consecuencias.',
    color: '#A87A1F',
    orden: 4,
    actividad: { nombre: 'Mejor Camino', descripcion: 'Elige el mejor camino hasta el premio.', icono: 'route' },
  },
  {
    nombre: 'ESTIMACION_TEMPORAL',
    etiqueta: 'Estimación Temporal',
    descripcion: 'Calcular y anticipar la duración del tiempo.',
    color: '#006C9B',
    orden: 5,
    actividad: { nombre: 'Cuenta el Tiempo', descripcion: 'Estima cuánto tiempo pasa.', icono: 'timer' },
  },
  {
    nombre: 'EJECUCION_DUAL',
    etiqueta: 'Ejecución Dual',
    descripcion: 'Atender y realizar dos tareas a la vez.',
    color: '#9678CB',
    orden: 6,
    actividad: { nombre: 'Dos a la Vez', descripcion: 'Vigila dos ventanas al mismo tiempo.', icono: 'layers' },
  },
  {
    nombre: 'BRANCHING',
    etiqueta: 'Multitarea',
    descripcion: 'Retomar una tarea pendiente tras una interrupción.',
    color: '#B25580',
    orden: 7,
    actividad: { nombre: 'Retoma la Tarea', descripcion: 'Vuelve a la tarea donde la dejaste.', icono: 'sprout' },
  },
]

async function sembrarCatalogo() {
  for (const f of FUNCIONES) {
    const funcion = await prisma.funcionEjecutiva.upsert({
      where: { nombre: f.nombre },
      update: { etiqueta: f.etiqueta, descripcion: f.descripcion, color: f.color, orden: f.orden },
      create: { nombre: f.nombre, etiqueta: f.etiqueta, descripcion: f.descripcion, color: f.color, orden: f.orden },
    })

    let actividad = await prisma.actividad.findFirst({
      where: { funcionEjecutivaId: funcion.id, nombre: f.actividad.nombre },
    })
    if (!actividad) {
      actividad = await prisma.actividad.create({
        data: {
          funcionEjecutivaId: funcion.id,
          nombre: f.actividad.nombre,
          descripcion: f.actividad.descripcion,
          icono: f.actividad.icono,
          ordenDesbloqueo: 1,
        },
      })
    } else {
      // Mantiene el catálogo alineado con esta definición al re-ejecutar el
      // seed (p. ej. migración de emojis a nombres de íconos lucide).
      actividad = await prisma.actividad.update({
        where: { id: actividad.id },
        data: { descripcion: f.actividad.descripcion, icono: f.actividad.icono },
      })
    }

    for (const n of niveles(5)) {
      await prisma.nivelActividad.upsert({
        where: { actividadId_nivel: { actividadId: actividad.id, nivel: n.nivel } },
        update: { configuracion: n.configuracion, totalItems: n.totalItems, puntajeMaximo: n.puntajeMaximo },
        create: {
          actividadId: actividad.id,
          nivel: n.nivel,
          configuracion: n.configuracion,
          totalItems: n.totalItems,
          puntajeMaximo: n.puntajeMaximo,
        },
      })
    }
  }
}

async function sembrarUsuariosPrueba() {
  const hash = await bcrypt.hash('123456', 10)

  const terapeuta = await prisma.usuario.upsert({
    where: { correo: 'terapeuta@test.com' },
    update: {},
    create: {
      correo: 'terapeuta@test.com',
      contrasenaHash: hash,
      rol: RolUsuario.TERAPEUTA,
      terapeuta: { create: { nombres: 'Alex', apellidos: 'Zambrano' } },
    },
    include: { terapeuta: true },
  })

  await prisma.usuario.upsert({
    where: { correo: 'nino@test.com' },
    update: {},
    create: {
      correo: 'nino@test.com',
      contrasenaHash: hash,
      rol: RolUsuario.NINO,
      nino: {
        create: {
          nombres: 'Mateo',
          apellidos: 'Perez',
          fechaNacimiento: new Date('2016-05-10'),
          terapeutaId: terapeuta.terapeuta!.id,
        },
      },
    },
  })
}

async function main() {
  console.log('Sembrando catálogo de funciones ejecutivas y actividades...')
  await sembrarCatalogo()
  console.log('Sembrando usuarios de prueba...')
  await sembrarUsuariosPrueba()
  console.log('Seed completado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
