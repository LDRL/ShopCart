import { useQuery } from '@tanstack/react-query'

import { atributosCatalogoAdapter } from '../adapter'
import { getAtributos, getValoresAtributos } from '../api'

const CATALOGO_STALE_TIME = 5 * 60 * 1000

/**
 * Atributos y valores del catalogo para armar los filtros de color y talla.
 * Se piden ambos endpoints porque el segundo trae los valores de cada atributo.
 */
export const useAtributosCatalogo = () =>
  useQuery({
    queryKey: ['atributos', 'catalogo'],
    queryFn: async () => {
      const [atributos, valores] = await Promise.all([
        getAtributos(),
        getValoresAtributos(),
      ])

      return atributosCatalogoAdapter(atributos, valores)
    },
    staleTime: CATALOGO_STALE_TIME,
  })
