import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../app'
import { prisma } from '../config/prisma'
import { cifrarContrasena } from '../utiles/contrasena'

/**
 * Subfase 6.2 — Pruebas de autenticación y autorización (integración).
 *
 * Ejecutan peticiones HTTP reales contra la app Express (supertest, sin
 * levantar servidor) usando la base de datos de desarrollo y los usuarios
 * del seed. El caso "terapeuta no ve niños ajenos" crea un segundo
 * terapeuta real y lo elimina al final.
 */

const CORREO_TERAPEUTA = 'terapeuta@test.com'
const CORREO_NINO = 'nino@test.com'
const CONTRASENA = '123456'

// Segundo terapeuta, sin niños asignados (se limpia en afterAll).
const CORREO_TERAPEUTA_2 = `fase6.terapeuta.${Date.now()}@test.com`

let tokenTerapeuta = ''
let tokenNino = ''
let tokenTerapeuta2 = ''
let usuario2Id = ''

async function iniciarSesion(correo: string, contrasena: string) {
  return request(app).post('/api/autenticacion/login').send({ correo, contrasena })
}

beforeAll(async () => {
  tokenTerapeuta = (await iniciarSesion(CORREO_TERAPEUTA, CONTRASENA)).body.token
  tokenNino = (await iniciarSesion(CORREO_NINO, CONTRASENA)).body.token

  const usuario2 = await prisma.usuario.create({
    data: {
      correo: CORREO_TERAPEUTA_2,
      contrasenaHash: await cifrarContrasena(CONTRASENA),
      rol: 'TERAPEUTA',
      terapeuta: { create: { nombres: 'Prueba', apellidos: 'Fase Seis' } },
    },
  })
  usuario2Id = usuario2.id
  tokenTerapeuta2 = (await iniciarSesion(CORREO_TERAPEUTA_2, CONTRASENA)).body.token
})

afterAll(async () => {
  await prisma.terapeuta.deleteMany({ where: { usuarioId: usuario2Id } })
  await prisma.usuario.deleteMany({ where: { id: usuario2Id } })
  await prisma.$disconnect()
})

describe('login', () => {
  it('con credenciales correctas devuelve token y datos públicos', async () => {
    const res = await iniciarSesion(CORREO_TERAPEUTA, CONTRASENA)
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(20)
    expect(res.body.usuario.correo).toBe(CORREO_TERAPEUTA)
    expect(res.body.usuario.rol).toBe('TERAPEUTA')
    // Nunca debe exponer el hash de la contraseña.
    expect(res.body.usuario.contrasenaHash).toBeUndefined()
  })

  it('con contraseña incorrecta devuelve 401', async () => {
    const res = await iniciarSesion(CORREO_TERAPEUTA, 'incorrecta')
    expect(res.status).toBe(401)
    expect(res.body.error).toBeDefined()
  })

  it('con un correo inexistente devuelve 401 (sin revelar si existe)', async () => {
    const res = await iniciarSesion('nadie@test.com', CONTRASENA)
    expect(res.status).toBe(401)
  })
})

describe('autorización por rol', () => {
  it('una ruta de terapeuta rechaza el token de un niño (403)', async () => {
    const res = await request(app)
      .get('/api/ninos')
      .set('Authorization', `Bearer ${tokenNino}`)
    expect(res.status).toBe(403)
  })

  it('una ruta protegida rechaza a un usuario no autenticado (401)', async () => {
    const res = await request(app).get('/api/progreso')
    expect(res.status).toBe(401)
  })

  it('una ruta protegida rechaza un token inválido (401)', async () => {
    const res = await request(app)
      .get('/api/intentos')
      .set('Authorization', 'Bearer token-falso')
    expect(res.status).toBe(401)
  })
})

describe('aislamiento entre terapeutas', () => {
  it('un terapeuta no puede ver un niño que no le pertenece (404)', async () => {
    // El primer terapeuta sí ve a sus niños…
    const propios = await request(app)
      .get('/api/ninos')
      .set('Authorization', `Bearer ${tokenTerapeuta}`)
    expect(propios.status).toBe(200)
    expect(propios.body.length).toBeGreaterThan(0)

    // …pero para el segundo terapeuta ese mismo niño "no existe".
    const ninoAjenoId = propios.body[0].id
    const res = await request(app)
      .get(`/api/ninos/${ninoAjenoId}`)
      .set('Authorization', `Bearer ${tokenTerapeuta2}`)
    expect(res.status).toBe(404)
  })

  it('tampoco puede listar sus intentos ni su progreso (404)', async () => {
    const propios = await request(app)
      .get('/api/ninos')
      .set('Authorization', `Bearer ${tokenTerapeuta}`)
    const ninoAjenoId = propios.body[0].id

    const intentos = await request(app)
      .get(`/api/intentos?ninoId=${ninoAjenoId}`)
      .set('Authorization', `Bearer ${tokenTerapeuta2}`)
    expect(intentos.status).toBe(404)

    const progreso = await request(app)
      .get(`/api/progreso?ninoId=${ninoAjenoId}`)
      .set('Authorization', `Bearer ${tokenTerapeuta2}`)
    expect(progreso.status).toBe(404)
  })
})
