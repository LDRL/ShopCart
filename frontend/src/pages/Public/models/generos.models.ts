import type { Paginacion } from './categorias.models'

export interface GeneroDto {
  IDGenero: number
  nombre: string
  estado: boolean
}

export interface GenerosResponse {
  msg: string
  data: GeneroDto[]
  paginacion: Paginacion
}
