import type { Genero } from '../domain'
import type { GeneroDto, GenerosResponse } from '../models'

const toGenero = (dto: GeneroDto): Genero => ({
  id: dto.IDGenero,
  nombre: dto.nombre,
  activo: dto.estado,
})

export const generosAdapter = (response: GenerosResponse): Genero[] =>
  response.data.map(toGenero)
