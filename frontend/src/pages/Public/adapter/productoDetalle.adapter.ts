import type { ColorProducto } from '../domain'
import { hexPorNombreColor } from '../domain'
import type {
  ProductoDetalle,
  TallaProducto,
  VarianteProductoDetalle,
} from '../domain/productoDetalle.domain'
import {
  esAtributoColor,
  esAtributoTalla,
} from '../domain/productoDetalle.domain'
import type {
  AtributoDetalleDto,
  ProductoDetalleResponse,
  VarianteDetalleDto,
} from '../models'

const obtenerColorId = (
  atributos: AtributoDetalleDto[],
): number | null =>
  atributos.find((atributo) => esAtributoColor(atributo.rol))
    ?.IDValorAtributo ?? null

const obtenerTallas = (atributos: AtributoDetalleDto[]): TallaProducto[] =>
  atributos
    .filter((atributo) => esAtributoTalla(atributo.rol))
    .map((atributo) => ({
      id: atributo.IDValorAtributo,
      nombre: atributo.valor,
      stock: 0,
    }))

const toVariante = (dto: VarianteDetalleDto): VarianteProductoDetalle => ({
  id: dto.IDProductoVariante,
  precio: Number(dto.precio),
  stock: Number(dto.stock),
  activa: dto.estado,
  colorId: obtenerColorId(dto.atributos),
  tallas: obtenerTallas(dto.atributos).map((talla) => ({
    ...talla,
    stock: Number(dto.stock),
  })),
})

const obtenerColores = (
  variantes: VarianteProductoDetalle[],
): ColorProducto[] => {
  const porId = new Map<number, ColorProducto>()

  variantes
    .filter((variante) => variante.activa && variante.colorId !== null)
    .forEach((variante) => {
      if (porId.has(variante.colorId as number)) return

      const color = variante.colorId as number
      porId.set(color, {
        id: color,
        nombre: '',
        hex: '#94a3b8',
      })
    })

  return [...porId.values()]
}

const completarNombresDeColores = (
  colores: ColorProducto[],
  dto: ProductoDetalleResponse['data'],
): ColorProducto[] => {
  const nombrePorId = new Map<number, string>()

  dto.variantes.forEach((variante) => {
    variante.atributos
      .filter((atributo) => esAtributoColor(atributo.rol))
      .forEach((atributo) => {
        nombrePorId.set(atributo.IDValorAtributo, atributo.valor)
      })
  })

  dto.imagenes.forEach((imagen) => {
    if (imagen.IDValorColor !== null && imagen.Color) {
      nombrePorId.set(imagen.IDValorColor, imagen.Color)
    }
  })

  return colores.map((color) => {
    const nombre = nombrePorId.get(color.id) ?? `Color ${color.id}`

    return {
      ...color,
      nombre,
      hex: hexPorNombreColor(nombre),
    }
  })
}

export const productoDetalleAdapter = (
  response: ProductoDetalleResponse,
): ProductoDetalle => {
  const dto = response.data
  const variantes = dto.variantes.map(toVariante)

  const colores = completarNombresDeColores(obtenerColores(variantes), dto)

  return {
    id: dto.IDProducto,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    precio: Number(dto.precioBase),
    genero: dto.genero,
    categoria: dto.categoria,
    colores,
    variantes,
    imagenes: dto.imagenes.map((imagen, index) => ({
      id: `${imagen.campo}-${index}`,
      url: imagen.urlImagen,
      idColor: imagen.IDValorColor,
      esPrincipal: imagen.esPrincipal,
    })),
  }
}
