import type { Categoria } from '../domain'
import type {
  CategoriaDto,
  CategoriasResponse,
  Paginacion,
} from '../models'

export interface CategoriasView {
  categorias: Categoria[]
  paginacion: Paginacion
}

const toCategoria = (dto: CategoriaDto): Categoria => ({
  id: dto.IDCategoria,
  nombre: dto.nombre,
  fechaCreacion: dto.fechaCreacion,
  activa: dto.estado,
})

export const categoriasAdapter = (
  response: CategoriasResponse,
): CategoriasView => ({
  categorias: response.data.map(toCategoria),
  paginacion: response.paginacion,
})
