import { useQuery } from '@tanstack/react-query'

import { generosAdapter } from '../adapter'
import { getGeneros } from '../api'

const CATALOGO_STALE_TIME = 5 * 60 * 1000

export const useGeneros = () =>
  useQuery({
    queryKey: ['generos'],
    queryFn: getGeneros,
    select: generosAdapter,
    staleTime: CATALOGO_STALE_TIME,
  })
