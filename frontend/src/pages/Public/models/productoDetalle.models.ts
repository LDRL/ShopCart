export interface AtributoDetalleDto {
  IDAtributo: number
  IDValorAtributo: number
  rol: string
  Atributo: string
  valor: string
}

export interface VarianteDetalleDto {
  IDProductoVariante: number
  sku: string
  precio: number
  estado: boolean
  stock: number
  atributos: AtributoDetalleDto[]
}

export interface ImagenDetalleDto {
  campo: string
  urlImagen: string
  esPrincipal: boolean
  IDValorColor: number | null
  Color: string | null
}

export interface ProductoDetalleDto {
  IDProducto: number
  IDGenero: number
  IDCategoria: number
  genero: string
  categoria: string
  nombre: string
  descripcion: string
  precioBase: number
  estado: boolean
  variantes: VarianteDetalleDto[]
  imagenes: ImagenDetalleDto[]
}

export interface ProductoDetalleResponse {
  msg: string
  data: ProductoDetalleDto
}
