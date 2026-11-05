import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { productosShopAdapter } from '../adapter'
import { getProductosShop } from '../api'

interface UseProductosParams {
  pagina: number
  registrosPorPagina: number
  idGenero: number | null
  idCategoria: number | null
  buscar: string
}

export const useProductos = ({
  pagina,
  registrosPorPagina,
  idGenero,
  idCategoria,
  buscar,
}: UseProductosParams) =>
  useQuery({
    queryKey: [
      'productos',
      'shop',
      pagina,
      registrosPorPagina,
      idGenero,
      idCategoria,
      buscar,
    ],
    queryFn: () =>
      getProductosShop({
        pagina,
        registrosPorPagina,
        idGenero,
        idCategoria,
        buscar: buscar.trim() || undefined,
      }),
    select: productosShopAdapter,
    placeholderData: keepPreviousData,
  })
