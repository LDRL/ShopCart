import { apiClient } from '../../../api/axiosClient'
import type { ProductosShopQuery, ProductosShopResponse } from '../models'

export const getProductosShop = async ( query: ProductosShopQuery, ): Promise<ProductosShopResponse> => {
  const { data } = await apiClient.get<ProductosShopResponse>(
    '/public/productos/shop',
    {
      params: {
        pagina: query.pagina ?? undefined,
        registrosPorPagina: query.registrosPorPagina ?? undefined,
        idGenero: query.idGenero ?? undefined,
        idCategoria: query.idCategoria ?? undefined,
        buscar: query.buscar?.trim() || undefined,
        atributos:
          query.atributos && query.atributos.length > 0
            ? JSON.stringify(query.atributos)
            : undefined,
      },
    },
  )

  return data
}
