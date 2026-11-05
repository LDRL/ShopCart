import { apiClient } from '../../../api/axiosClient'
import type { ProductoDetalleResponse } from '../models'

export const getProductoDetalle = async (
  id: number,
): Promise<ProductoDetalleResponse> => {
  const { data } = await apiClient.get<ProductoDetalleResponse>(
    `/public/productos/${id}`,
  )

  return data
}
