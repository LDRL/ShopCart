import { useQuery } from '@tanstack/react-query'

import { productoDetalleAdapter } from '../adapter'
import { getProductoDetalle } from '../api'

export const useProductoDetalle = (id: number) =>
  useQuery({
    queryKey: ['productos', 'detalle', id],
    queryFn: () => getProductoDetalle(id),
    select: productoDetalleAdapter,
    enabled: Number.isSafeInteger(id) && id > 0,
  })
