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
  // El backend responde 400 si se envia solo uno de los dos parametros de
  // paginacion, asi que ambos son opcionales y se envian juntos o ninguno.
  pagina?: number
  registrosPorPagina?: number
  buscar?: string
}
