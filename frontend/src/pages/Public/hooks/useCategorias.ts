import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { categoriasAdapter } from '../adapter'
import { getCategorias } from '../api'

interface UseCategoriasParams {
  pagina: number
  registrosPorPagina: number
  buscar: string
}

export const useCategorias = ({
  pagina,
  registrosPorPagina,
  buscar,
}: UseCategoriasParams) =>
  useQuery({
    queryKey: ['categorias', pagina, registrosPorPagina, buscar],
    queryFn: () =>
      getCategorias({
        pagina,
        registrosPorPagina,
        buscar: buscar.trim() || undefined,
      }),
    select: categoriasAdapter,
    placeholderData: keepPreviousData,
  })
