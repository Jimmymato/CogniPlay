import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../app'
import { prisma } from '../config/prisma'

/**
 * Subfase 6.3 — Pruebas del flujo de intento (integración end-to-end).
 *
 * Crea un niño de prueba propio (vía API, como haría el terapeuta), juega
 * intentos reales y comprueba las reglas del flujo:
 *  - intento válido → se registra y devuelve la decisión del motor;
 *  - actividad bloqueada por el terapeuta → 409;
 *  - conteos que no cuadran con el nivel → 400;
 *  - sesión cerrada → 400 (equivale al "intento ya finalizado" del spec:
 *    los intentos se envían completos y atómicos, no hay estado "iniciado").
 * Todo lo creado se elimina en afterAll.
 */

const CONTRASENA = '123456'
const CORREO_NINO_PRUEBA = `fase6.nino.${Date.now()}@test.com`

let tokenTerapeuta = ''
let tokenNino = ''
let ninoId = ''

// Dos actividades del catálogo con su nivel FACIL (la segunda se bloquea).
let actividadJugable: { id: string; totalItems: number }
let actividadBloqueada: { id: string; totalItems: number }

async function iniciarSesion(correo: string) {
  const res = await request(app)
    .post('/api/autenticacion/login')
    .send({ correo, contrasena: CONTRASENA })
  return res.body.token as string
}

function enviarIntento(datos: Record<string, unknown>) {
  return request(app)
    .post('/api/intentos')
    .set('Authorization', `Bearer ${tokenNino}`)
    .send({ nivel: 'FACIL', tiempoSegundos: 30, ...datos })
}

beforeAll(async () => {
  tokenTerapeuta = await iniciarSesion('terapeuta@test.com')

  // Alta del niño de prueba por la vía oficial (POST /api/ninos).
  const alta = await request(app)
    .post('/api/ninos')
    .set('Authorization', `Bearer ${tokenTerapeuta}`)
    .send({
      nombres: 'Prueba',
      apellidos: 'Fase Seis',
      fechaNacimiento: '2017-05-10',
      correo: CORREO_NINO_PRUEBA,
      contrasena: CONTRASENA,
    })
  if (alta.status !== 201) throw new Error(`No se pudo crear el niño: ${alta.text}`)
  ninoId = alta.body.id

  tokenNino = await iniciarSesion(CORREO_NINO_PRUEBA)

  // Se toman dos actividades reales del catálogo con su nivel FACIL.
  const funciones = await request(app)
    .get('/api/funciones')
    .set('Authorization', `Bearer ${tokenNino}`)
  const actividades = funciones.body.flatMap(
    (f: { actividades?: { id: string; niveles: { nivel: string; totalItems: number }[] }[] }) =>
      f.actividades ?? [],
  )
  const conFacil = actividades
    .map((a: { id: string; niveles: { nivel: string; totalItems: number }[] }) => ({
      id: a.id,
      totalItems: a.niveles.find((n) => n.nivel === 'FACIL')?.totalItems,
    }))
    .filter((a: { totalItems?: number }) => a.totalItems != null)
  if (conFacil.length < 2) throw new Error('El seed no tiene 2 actividades con nivel FACIL')
  ;[actividadJugable, actividadBloqueada] = conFacil
})

afterAll(async () => {
  // Limpieza en orden de dependencias de todo lo generado por la suite.
  // Solo si el alta llegó a crear el niño; el usuario se borra por su correo
  // único (nunca por un id que podría ser undefined: Prisma ignora los
  // filtros undefined y un deleteMany sin filtro borraría toda la tabla).
  if (ninoId) {
    await prisma.decisionProgresion.deleteMany({ where: { ninoId } })
    await prisma.notificacion.deleteMany({ where: { ninoId } })
    await prisma.refuerzo.deleteMany({ where: { ninoId } })
    await prisma.intento.deleteMany({ where: { ninoId } })
    await prisma.recomendacion.deleteMany({ where: { sesion: { ninoId } } })
    await prisma.resumenFuncionPorSesion.deleteMany({ where: { sesion: { ninoId } } })
    await prisma.sesion.deleteMany({ where: { ninoId } })
    await prisma.progresoActividad.deleteMany({ where: { ninoId } })
    await prisma.nino.deleteMany({ where: { id: ninoId } })
  }
  await prisma.usuario.deleteMany({ where: { correo: CORREO_NINO_PRUEBA } })
  await prisma.$disconnect()
})

describe('registrar un intento en una actividad disponible', () => {
  it('guarda el intento y devuelve la decisión del motor adaptativo', async () => {
    const total = actividadJugable.totalItems
    const res = await enviarIntento({
      actividadId: actividadJugable.id,
      respuestasCorrectas: total,
      respuestasIncorrectas: 0,
      omisiones: 0,
    })

    expect(res.status).toBe(201)
    expect(res.body.completado).toBe(true)
    expect(Number(res.body.precision)).toBe(100)

    // La decisión llega en la misma respuesta (intento + motor, atómicos).
    expect(res.body.progresion.decision.decision).toBe('AUMENTAR_DIFICULTAD')
    expect(res.body.progresion.progreso.nivelActual).toBe('MEDIO')
  })

  it('solo el rol NINO puede registrar intentos (403 para terapeuta)', async () => {
    const res = await request(app)
      .post('/api/intentos')
      .set('Authorization', `Bearer ${tokenTerapeuta}`)
      .send({
        actividadId: actividadJugable.id,
        nivel: 'FACIL',
        respuestasCorrectas: 5,
        respuestasIncorrectas: 0,
        omisiones: 0,
        tiempoSegundos: 30,
      })
    expect(res.status).toBe(403)
  })
})

describe('validaciones del intento', () => {
  it('rechaza conteos que no suman el total de ítems del nivel (400)', async () => {
    const res = await enviarIntento({
      actividadId: actividadJugable.id,
      respuestasCorrectas: 1,
      respuestasIncorrectas: 0,
      omisiones: 0, // suma 1 ≠ totalItems del nivel
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('total de ítems')
  })

  it('rechaza una actividad inexistente (404)', async () => {
    const res = await enviarIntento({
      actividadId: crypto.randomUUID(),
      respuestasCorrectas: 5,
      respuestasIncorrectas: 0,
      omisiones: 0,
    })
    expect(res.status).toBe(404)
  })
})

describe('actividad bloqueada por el terapeuta', () => {
  it('no acepta intentos (409)', async () => {
    const bloqueo = await request(app)
      .patch('/api/progreso/bloqueo')
      .set('Authorization', `Bearer ${tokenTerapeuta}`)
      .send({
        ninoId,
        actividadId: actividadBloqueada.id,
        bloqueada: true,
        razon: 'Prueba automatizada 6.3',
      })
    expect(bloqueo.status).toBe(200)

    const total = actividadBloqueada.totalItems
    const res = await enviarIntento({
      actividadId: actividadBloqueada.id,
      respuestasCorrectas: total,
      respuestasIncorrectas: 0,
      omisiones: 0,
    })
    expect(res.status).toBe(409)
    expect(res.body.error).toContain('bloqueada')
  })
})

describe('sesión cerrada (el "intento ya finalizado" del flujo)', () => {
  it('una sesión cerrada no acepta más intentos (400)', async () => {
    const abierta = await request(app)
      .post('/api/sesiones')
      .set('Authorization', `Bearer ${tokenTerapeuta}`)
      .send({ ninoId })
    expect(abierta.status).toBe(201)
    const sesionId = abierta.body.id

    const cierre = await request(app)
      .patch(`/api/sesiones/${sesionId}/cerrar`)
      .set('Authorization', `Bearer ${tokenTerapeuta}`)
    expect(cierre.status).toBe(200)

    const res = await enviarIntento({
      actividadId: actividadJugable.id,
      sesionId,
      respuestasCorrectas: actividadJugable.totalItems,
      respuestasIncorrectas: 0,
      omisiones: 0,
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('no está en curso')
  })
})
