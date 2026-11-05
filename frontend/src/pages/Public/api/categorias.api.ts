import { apiClient } from '../../../api/axiosClient'
import type { CategoriasQuery, CategoriasResponse } from '../models'

export const getCategorias = async (
  query: CategoriasQuery,
): Promise<CategoriasResponse> => {
  const { data } = await apiClient.get<CategoriasResponse>(
    '/public/categorias',
    {
      params: {
        pagina: query.pagina,
        registrosPorPagina: query.registrosPorPagina,
        buscar: query.buscar?.trim() || undefined,
      },
    },
  )

  return data
}
