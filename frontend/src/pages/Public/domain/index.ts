export type { Categoria } from './categorias.domain'
export { ETIQUETA_TODOS, ETIQUETA_VER_TODO, generoMuestraCategorias } from './genero.domain'
export type { FiltroCatalogo, Genero } from './genero.domain'
export {
  esAtributoColor,
  esAtributoTalla,
  imagenPrincipalDeColor,
  imagenesDeColor,
  tallasDeColor,
  variantesDeColor,
} from './productoDetalle.domain'
export type {
  ImagenProductoDetalle,
  ProductoDetalle,
  TallaProducto,
  VarianteProductoDetalle,
} from './productoDetalle.domain'
export {
  formatearPrecio,
  hexPorNombreColor,
  PRODUCTOS_POR_PAGINA,
} from './producto.domain'
export type { ColorProducto, Producto } from './producto.domain'
