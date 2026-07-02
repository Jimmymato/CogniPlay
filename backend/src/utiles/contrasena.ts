import bcrypt from 'bcryptjs'

const RONDAS = 10

export const cifrarContrasena = (texto: string) => bcrypt.hash(texto, RONDAS)

export const verificarContrasena = (texto: string, hash: string) =>
  bcrypt.compare(texto, hash)
