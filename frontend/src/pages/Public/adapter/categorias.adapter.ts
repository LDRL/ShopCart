import type { Categoria } from '../domain'
import type { CategoriaDto, CategoriasResponse } from '../models'

const toCategoria = (dto: CategoriaDto): Categoria => ({
  id: dto.IDCategoria,
  nombre: dto.nombre,
  fechaCreacion: dto.fechaCreacion,
  activa: dto.estado,
})

/** Categorias navegables del submenu: sin paginacion y sin las inactivas. */
export const categoriasMenuAdapter = (
  response: CategoriasResponse,
): Categoria[] =>
  response.data
    .map(toCategoria)
    .filter((categoria) => categoria.activa)
