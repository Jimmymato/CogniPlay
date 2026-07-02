export class ErrorHttp extends Error {
  estado: number

  constructor(estado: number, mensaje: string) {
    super(mensaje)
    this.estado = estado
    this.name = 'ErrorHttp'
  }
}

export const solicitudInvalida = (m = 'Solicitud inválida') => new ErrorHttp(400, m)
export const noAutorizado = (m = 'No autorizado') => new ErrorHttp(401, m)
export const prohibido = (m = 'Acceso prohibido') => new ErrorHttp(403, m)
export const noEncontrado = (m = 'Recurso no encontrado') => new ErrorHttp(404, m)
export const conflicto = (m = 'Conflicto') => new ErrorHttp(409, m)
