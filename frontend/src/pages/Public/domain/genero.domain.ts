export interface Genero {
  id: number
  nombre: string
  activo: boolean
}

export interface FiltroCatalogo {
  idGenero: number | null
  idCategoria: number | null
}

/**
 * "Ver todo" no existe en el backend: es el primer item sintetico del submenu
 * de categorias, para limpiar el filtro de categoria sin salir del genero.
 */
export const ETIQUETA_VER_TODO = 'Ver todo'

/**
 * Solo estos generos despliegan el submenu de categorias. Se compara sobre el
 * nombre normalizado porque el backend devuelve los nombres con acentos y
 * mayusculas ("Hombres", "Mujeres", "Niños").
 */
const GENEROS_CON_CATEGORIAS = ['hombres', 'mujeres'] as const

export const normalizarNombreGenero = (nombre: string): string =>
  nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

export const generoMuestraCategorias = (nombre: string): boolean =>
  GENEROS_CON_CATEGORIAS.includes(
    normalizarNombreGenero(nombre) as (typeof GENEROS_CON_CATEGORIAS)[number],
  )
