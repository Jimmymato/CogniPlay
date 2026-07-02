import { prisma } from '../../config/prisma'
import { verificarContrasena } from '../../utiles/contrasena'
import { noAutorizado } from '../../utiles/errores'
import { firmarToken } from '../../utiles/jwt'

interface DatosLogin {
  correo: string
  contrasena: string
}

function aDatosPublicos(usuario: {
  id: string
  correo: string
  rol: 'TERAPEUTA' | 'NINO'
  terapeuta: unknown
  nino: unknown
}) {
  return {
    id: usuario.id,
    correo: usuario.correo,
    rol: usuario.rol,
    perfil: usuario.terapeuta ?? usuario.nino,
  }
}

export async function iniciarSesion({ correo, contrasena }: DatosLogin) {
  const usuario = await prisma.usuario.findUnique({
    where: { correo },
    include: { terapeuta: true, nino: true },
  })
  if (!usuario || !usuario.activo) throw noAutorizado('Credenciales inválidas')

  const valida = await verificarContrasena(contrasena, usuario.contrasenaHash)
  if (!valida) throw noAutorizado('Credenciales inválidas')

  const token = firmarToken({ usuarioId: usuario.id, rol: usuario.rol })
  return { token, usuario: aDatosPublicos(usuario) }
}

export async function obtenerPerfil(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { terapeuta: true, nino: true },
  })
  if (!usuario) throw noAutorizado('Sesión inválida')
  return aDatosPublicos(usuario)
}
