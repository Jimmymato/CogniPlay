import 'dotenv/config'

function requerido(nombre: string): string {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`)
  return valor
}

export const entorno = {
  puerto: Number(process.env.PORT ?? 4000),
  databaseUrl: requerido('DATABASE_URL'),
  jwtSecret: requerido('JWT_SECRET'),
  jwtExpiracion: process.env.JWT_EXPIRACION ?? '7d',
}
