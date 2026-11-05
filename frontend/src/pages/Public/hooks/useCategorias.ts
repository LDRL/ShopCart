import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { categoriasAdapter, categoriasMenuAdapter } from '../adapter'
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

/**
 * Categorias completas para el submenu del menu vertical: sin paginacion y
 * solo las activas
 */
export const useCategoriasMenu = () =>
  useQuery({
    queryKey: ['categorias', 'menu'],
    queryFn: () => getCategorias({}),
    select: categoriasMenuAdapter,
    staleTime: 5 * 60 * 1000,
  })
