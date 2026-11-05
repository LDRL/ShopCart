import { useQuery } from '@tanstack/react-query'

import { categoriasMenuAdapter } from '../adapter'
import { getCategorias } from '../api'

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
