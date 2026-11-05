import type { ColorProducto } from './producto.domain'

export interface TallaProducto {
  id: number
  nombre: string
  stock: number
}

export interface ImagenProductoDetalle {
  id: string
  url: string
  idColor: number | null
  esPrincipal: boolean
}

export interface VarianteProductoDetalle {
  id: number
  precio: number
  stock: number
  activa: boolean
  colorId: number | null
  tallas: TallaProducto[]
}

export interface ProductoDetalle {
  id: number
  nombre: string
  descripcion: string
  precio: number
  genero: string
  categoria: string
  colores: ColorProducto[]
  variantes: VarianteProductoDetalle[]
  imagenes: ImagenProductoDetalle[]
}

const esRol = (rol: string, esperado: string): boolean =>
  rol.trim().toUpperCase() === esperado

export const variantesDeColor = (
  producto: ProductoDetalle,
  idColor: number | null,
): VarianteProductoDetalle[] => {
  if (producto.colores.length === 0) {
    return producto.variantes.filter((variante) => variante.activa)
  }

  return producto.variantes.filter(
    (variante) => variante.activa && variante.colorId === idColor,
  )
}

/**
 * Tallas disponibles para el color seleccionado. Si el producto no maneja
 * colores (idColor null) se usan todas las variantes activas.
 */
export const tallasDeColor = (
  producto: ProductoDetalle,
  idColor: number | null,
): TallaProducto[] => {
  const tallas = new Map<number, TallaProducto>()

  variantesDeColor(producto, idColor).forEach((variante) => {
    variante.tallas.forEach((talla) => {
      const actual = tallas.get(talla.id)

      if (actual) {
        actual.stock += talla.stock
        return
      }

      tallas.set(talla.id, { ...talla })
    })
  })

  return [...tallas.values()]
}

/**
 * Imagenes asociadas al color. Si el color no tiene imagenes propias se usan
 * las imagenes genericas del producto; si tampoco hay, la primera disponible.
 */
export const imagenesDeColor = (
  producto: ProductoDetalle,
  idColor: number | null,
): ImagenProductoDetalle[] => {
  const delColor =
    idColor === null
      ? []
      : producto.imagenes.filter((imagen) => imagen.idColor === idColor)

  const genericas = producto.imagenes.filter(
    (imagen) => imagen.idColor === null,
  )

  const seleccionadas =
    delColor.length > 0 ? delColor : genericas.length > 0 ? genericas : []

  return [...seleccionadas].sort(
    (a, b) => Number(b.esPrincipal) - Number(a.esPrincipal),
  )
}

export const imagenPrincipalDeColor = (
  producto: ProductoDetalle,
  idColor: number | null,
): ImagenProductoDetalle | null => imagenesDeColor(producto, idColor)[0] ?? null

export const esAtributoColor = (rol: string): boolean => esRol(rol, 'COLOR')

export const esAtributoTalla = (rol: string): boolean => esRol(rol, 'TALLA')
