export interface ColorProducto {
  id: number
  nombre: string
  hex: string
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string | null
  genero: string
  categoria: string
  colores: ColorProducto[]
}

export const PRODUCTOS_POR_PAGINA = 28

/**
 * Los valores de color viven en `ValoresAtributos` solo con su nombre, no con
 * un hexadecimal. Este mapa traduce los nombres que existen hoy en la base a
 * un color visible en la ficha.
 */
const HEX_POR_COLOR: Record<string, string> = {
  azul: '#2563eb',
  negro: '#111827',
  blanco: '#ffffff',
  gris: '#9ca3af',
  rojo: '#dc2626',
  verde: '#16a34a',
}

const COLOR_DESCONOCIDO = '#94a3b8'

const normalizar = (valor: string): string =>
  valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const hexPorNombreColor = (nombre: string): string =>
  HEX_POR_COLOR[normalizar(nombre)] ?? COLOR_DESCONOCIDO

const formatoPrecio = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

export const formatearPrecio = (precio: number): string =>
  Number.isFinite(precio) ? formatoPrecio.format(precio) : '—'
