import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { productosShopAdapter } from '../adapter'
import { getProductosShop } from '../api'
import type { AtributoFiltroQuery } from '../domain'
import type { ProductosShopResponse } from '../models'

interface UseProductosParams {
  pagina: number
  registrosPorPagina: number
  idGenero: number | null
  idCategoria: number | null
  buscar: string
  atributos?: AtributoFiltroQuery[]
  precioMinimo?: number | null
  precioMaximo?: number | null
}

/**
 * El endpoint del shop no filtra por precio. Cuando hay un rango activo se
 * piden todos los resultados que ya filtro el backend (genero, categoria,
 * busqueda, atributos) y el precio + la paginacion se resuelven en el cliente.
 */
const filtrarPorPrecio = (
  response: ProductosShopResponse,
  pagina: number,
  registrosPorPagina: number,
  precioMinimo: number | null,
  precioMaximo: number | null,
) => {
  const view = productosShopAdapter(response)

  const productos = view.productos.filter((producto) => {
    if (precioMinimo !== null && producto.precio < precioMinimo) return false
    if (precioMaximo !== null && producto.precio > precioMaximo) return false

    return true
  })

  const totalRegistros = productos.length
  const totalPaginas = Math.max(
    1,
    Math.ceil(totalRegistros / registrosPorPagina),
  )
  const paginaActual = Math.min(Math.max(pagina, 1), totalPaginas)
  const inicio = (paginaActual - 1) * registrosPorPagina

  return {
    productos: productos.slice(inicio, inicio + registrosPorPagina),
    paginacion: {
      pagina: paginaActual,
      registrosPorPagina,
      totalRegistros,
      totalPaginas,
    },
  }
}

export const useProductos = ({
  pagina,
  registrosPorPagina,
  idGenero,
  idCategoria,
  buscar,
  atributos = [],
  precioMinimo = null,
  precioMaximo = null,
}: UseProductosParams) => {
  const filtraPorPrecio = precioMinimo !== null || precioMaximo !== null
  const paginaRemota = filtraPorPrecio ? null : pagina
  const registrosRemotos = filtraPorPrecio ? null : registrosPorPagina

  const query = useQuery({
    queryKey: [
      'productos',
      'shop',
      paginaRemota,
      registrosRemotos,
      idGenero,
      idCategoria,
      buscar,
      atributos,
      precioMinimo,
      precioMaximo,
    ],
    queryFn: () =>
      getProductosShop({
        pagina: paginaRemota,
        registrosPorPagina: registrosRemotos,
        idGenero,
        idCategoria,
        buscar: buscar.trim() || undefined,
        atributos,
      }),
    placeholderData: keepPreviousData,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined

    return filtraPorPrecio
      ? filtrarPorPrecio(
          query.data,
          pagina,
          registrosPorPagina,
          precioMinimo,
          precioMaximo,
        )
      : productosShopAdapter(query.data)
  }, [
    query.data,
    filtraPorPrecio,
    pagina,
    registrosPorPagina,
    precioMinimo,
    precioMaximo,
  ])

  return { ...query, data }
}
