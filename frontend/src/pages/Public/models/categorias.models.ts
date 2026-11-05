export interface CategoriaDto {
  IDCategoria: number
  nombre: string
  fechaCreacion: string
  estado: boolean
}

export interface Paginacion {
  pagina: number | null
  registrosPorPagina: number | null
  totalRegistros: number
  totalPaginas: number | null
}

export interface CategoriasResponse {
  msg: string
  data: CategoriaDto[]
  paginacion: Paginacion
}

export interface CategoriasQuery {
  pagina: number
  registrosPorPagina: number
  buscar?: string
}
