import type { Paginacion } from './categorias.models'

export interface AtributoDto {
  IDAtributo: number
  nombre: string
  estado: boolean
  rol: string
}

export interface AtributosResponse {
  msg: string
  data: AtributoDto[]
  paginacion: Paginacion
}

export interface ValorAtributoDto {
  IDValorAtributo: number
  IDAtributo: number
  Atributo: string
  AtributoEstado: boolean
  valor: string
}

export interface ValoresAtributoResponse {
  msg: string
  data: ValorAtributoDto[]
  paginacion: Paginacion
}
