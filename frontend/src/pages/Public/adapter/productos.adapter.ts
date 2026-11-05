import type { ColorProducto, Producto } from '../domain'
import { hexPorNombreColor } from '../domain'
import type {
  AtributoVarianteDto,
  Paginacion,
  ProductoShopDto,
  ProductosShopResponse,
  VarianteShopDto,
} from '../models'

export interface ProductosView {
  productos: Producto[]
  paginacion: Paginacion
}

const parsearAtributos = (
  raw: VarianteShopDto['atributos'],
): AtributoVarianteDto[] => {
  if (Array.isArray(raw)) return raw
  if (typeof raw !== 'string' || raw.trim() === '') return []

  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AtributoVarianteDto[]) : []
  } catch {
    return []
  }
}

const esAtributoColor = (atributo: AtributoVarianteDto): boolean =>
  atributo.atributo?.trim().toLowerCase() === 'color'

const agruparVariantes = (
  variantes: VarianteShopDto[],
): Map<number, VarianteShopDto[]> => {
  const porProducto = new Map<number, VarianteShopDto[]>()

  variantes.forEach((variante) => {
    const actuales = porProducto.get(variante.IDProducto) ?? []
    actuales.push(variante)
    porProducto.set(variante.IDProducto, actuales)
  })

  return porProducto
}

const obtenerColores = (variantes: VarianteShopDto[]): ColorProducto[] => {
  const porId = new Map<number, ColorProducto>()

  variantes.forEach((variante) => {
    parsearAtributos(variante.atributos)
      .filter(esAtributoColor)
      .forEach((atributo) => {
        if (porId.has(atributo.idValorAtributo)) return

        porId.set(atributo.idValorAtributo, {
          id: atributo.idValorAtributo,
          nombre: atributo.valor,
          hex: hexPorNombreColor(atributo.valor),
        })
      })
  })

  return [...porId.values()]
}

const obtenerImagen = (dto: ProductoShopDto): string | null => {
  const url = dto.imagenPrincipal ?? dto.ImagenPrincipal ?? null
  return typeof url === 'string' && url.trim() !== '' ? url : null
}

const toProducto = (
  dto: ProductoShopDto,
  variantes: VarianteShopDto[],
): Producto => ({
  id: dto.IDProducto,
  nombre: dto.nombre,
  descripcion: dto.descripcion ?? '',
  precio: Number(dto.precioBase),
  imagen: obtenerImagen(dto),
  genero: dto.genero,
  categoria: dto.categoria,
  colores: obtenerColores(variantes),
})

export const productosShopAdapter = (
  response: ProductosShopResponse,
): ProductosView => {
  const variantesPorProducto = agruparVariantes(response.variantes ?? [])

  return {
    productos: (response.data ?? []).map((dto) =>
      toProducto(dto, variantesPorProducto.get(dto.IDProducto) ?? []),
    ),
    paginacion: response.paginacion,
  }
}
