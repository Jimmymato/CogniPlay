import { prisma } from '../../config/prisma'
import { cifrarContrasena } from '../../utiles/contrasena'
import { conflicto, noEncontrado, solicitudInvalida } from '../../utiles/errores'
import { obtenerTerapeutaId } from '../../utiles/perfiles'

interface DatosCrearNino {
  correo: string
  contrasena: string
  nombres: string
  apellidos: string
  fechaNacimiento: string
}

interface DatosActualizarNino {
  nombres?: string
  apellidos?: string
  fechaNacimiento?: string
}

type NinoConUsuario = {
  id: string
  nombres: string
  apellidos: string
  fechaNacimiento: Date
  activo: boolean
  creadoEn: Date
  usuario: { correo: string }
}

function aDatosNino(nino: NinoConUsuario) {
  return {
    id: nino.id,
    correo: nino.usuario.correo,
    nombres: nino.nombres,
    apellidos: nino.apellidos,
    fechaNacimiento: nino.fechaNacimiento,
    activo: nino.activo,
    creadoEn: nino.creadoEn,
  }
}

function interpretarFecha(valor: string) {
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) {
    throw solicitudInvalida('La fecha de nacimiento no es válida')
  }
  return fecha
}

export async function crearNino(usuarioIdTerapeuta: string, datos: DatosCrearNino) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)

  const correoExistente = await prisma.usuario.findUnique({
    where: { correo: datos.correo },
    select: { id: true },
  })
  if (correoExistente) throw conflicto('Ya existe un usuario con ese correo')

  const fechaNacimiento = interpretarFecha(datos.fechaNacimiento)
  const contrasenaHash = await cifrarContrasena(datos.contrasena)

  const nino = await prisma.$transaction(
    async (tx) => {
      const usuario = await tx.usuario.create({
        data: { correo: datos.correo, contrasenaHash, rol: 'NINO' },
      })
      return tx.nino.create({
        data: {
          usuarioId: usuario.id,
          terapeutaId,
          nombres: datos.nombres,
          apellidos: datos.apellidos,
          fechaNacimiento,
        },
        include: { usuario: { select: { correo: true } } },
      })
    },
    { maxWait: 10000, timeout: 15000 },
  )

  return aDatosNino(nino)
}

export async function listarNinos(usuarioIdTerapeuta: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const ninos = await prisma.nino.findMany({
    where: { terapeutaId },
    orderBy: { creadoEn: 'desc' },
    include: { usuario: { select: { correo: true } } },
  })
  return ninos.map(aDatosNino)
}

/** Busca un niño asegurando que pertenezca al terapeuta autenticado. */
async function buscarNinoPropio(usuarioIdTerapeuta: string, ninoId: string) {
  const terapeutaId = await obtenerTerapeutaId(usuarioIdTerapeuta)
  const nino = await prisma.nino.findFirst({
    where: { id: ninoId, terapeutaId },
    include: { usuario: { select: { correo: true } } },
  })
  if (!nino) throw noEncontrado('Niño no encontrado')
  return nino
}

export async function obtenerNino(usuarioIdTerapeuta: string, ninoId: string) {
  const nino = await buscarNinoPropio(usuarioIdTerapeuta, ninoId)
  return aDatosNino(nino)
}

export async function actualizarNino(
  usuarioIdTerapeuta: string,
  ninoId: string,
  datos: DatosActualizarNino,
) {
  await buscarNinoPropio(usuarioIdTerapeuta, ninoId)

  const nino = await prisma.nino.update({
    where: { id: ninoId },
    data: {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      fechaNacimiento:
        datos.fechaNacimiento !== undefined
          ? interpretarFecha(datos.fechaNacimiento)
          : undefined,
    },
    include: { usuario: { select: { correo: true } } },
  })
  return aDatosNino(nino)
}

export async function cambiarEstadoNino(
  usuarioIdTerapeuta: string,
  ninoId: string,
  activo: boolean,
) {
  const existente = await buscarNinoPropio(usuarioIdTerapeuta, ninoId)

  // Sincroniza el estado del perfil y del acceso (login) del niño.
  const nino = await prisma.$transaction(
    async (tx) => {
      await tx.usuario.update({
        where: { id: existente.usuarioId },
        data: { activo },
      })
      return tx.nino.update({
        where: { id: ninoId },
        data: { activo },
        include: { usuario: { select: { correo: true } } },
      })
    },
    { maxWait: 10000, timeout: 15000 },
  )
  return aDatosNino(nino)
}
