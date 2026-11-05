import type { Paginacion } from './categorias.models'

export interface ProductoShopDto {
  IDProducto: number
  nombre: string
  descripcion: string | null
  precioBase: number
  estado: boolean
  IDGenero: number
  genero: string
  IDCategoria: number
  categoria: string
  // El SP del shop devuelve ImagenPrincipal; se acepta tambien el formato
  // camelCase por compatibilidad.
  imagenPrincipal?: string | null
  ImagenPrincipal?: string | null
}

export interface AtributoVarianteDto {
  idAtributo: number
  atributo: string
  idValorAtributo: number
  valor: string
}

export interface VarianteShopDto {
  IDProductoVariante: number
  IDProducto: number
  SKU: string
  precio: number
  stock: number
  estado: boolean
  // El SP lo entrega como JSON en texto
  atributos: string | AtributoVarianteDto[] | null
}

export interface ProductosShopResponse {
  msg: string
  data: ProductoShopDto[]
  variantes: VarianteShopDto[]
  paginacion: Paginacion
}

export interface ProductosShopQuery {
  pagina: number
  registrosPorPagina: number
  idGenero?: number | null
  idCategoria?: number | null
  buscar?: string
}
