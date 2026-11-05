import { apiClient } from '../../../api/axiosClient'
import type { ProductosShopQuery, ProductosShopResponse } from '../models'

export const getProductosShop = async (
  query: ProductosShopQuery,
): Promise<ProductosShopResponse> => {
  const { data } = await apiClient.get<ProductosShopResponse>(
    '/public/productos/shop',
    {
      params: {
        pagina: query.pagina,
        registrosPorPagina: query.registrosPorPagina,
        idGenero: query.idGenero ?? undefined,
        idCategoria: query.idCategoria ?? undefined,
        buscar: query.buscar?.trim() || undefined,
      },
    },
  )

  return data
}
