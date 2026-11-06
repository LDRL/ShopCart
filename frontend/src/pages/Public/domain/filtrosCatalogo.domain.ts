export interface OpcionColorFiltro {
  id: number
  idAtributo: number
  nombre: string
  hex: string
}

export interface OpcionTallaFiltro {
  id: number
  idAtributo: number
  nombre: string
}

export interface AtributosCatalogo {
  colores: OpcionColorFiltro[]
  tallas: OpcionTallaFiltro[]
}

export interface FiltrosCatalogo {
  colores: number[]
  tallas: number[]
  precioDesde: string
  precioHasta: string
}

export interface AtributoFiltroQuery {
  idAtributo: number
  valores: number[]
}

export const FILTROS_CATALOGO_VACIOS: FiltrosCatalogo = {
  colores: [],
  tallas: [],
  precioDesde: '',
  precioHasta: '',
}

/**
 * El endpoint del shop recibe un JSON con los atributos seleccionados agrupados
 * por atributo: [{ idAtributo, valores: [idValorAtributo] }]. El panel guarda
 * solo los ids de valor, asi que aqui se reconstruye el agrupamiento.
 */
export const construirAtributosFiltro = (
  filtros: FiltrosCatalogo,
  catalogo: AtributosCatalogo,
): AtributoFiltroQuery[] => {
  const grupos = new Map<number, Set<number>>()

  const agregar = (
    opciones: Array<{ id: number; idAtributo: number }>,
    seleccionados: number[],
  ) => {
    seleccionados.forEach((id) => {
      const opcion = opciones.find((item) => item.id === id)

      if (!opcion) return

      const valores = grupos.get(opcion.idAtributo) ?? new Set<number>()
      valores.add(opcion.id)
      grupos.set(opcion.idAtributo, valores)
    })
  }

  agregar(catalogo.colores, filtros.colores)
  agregar(catalogo.tallas, filtros.tallas)

  return [...grupos.entries()].map(([idAtributo, valores]) => ({
    idAtributo,
    valores: [...valores],
  }))
}

/** Convierte el texto de un input de precio a numero. Vacio significa "sin limite". */
export const parsearPrecio = (valor: string): number | null => {
  const texto = valor.trim().replace(',', '.')

  if (texto === '') return null

  const numero = Number(texto)

  return Number.isFinite(numero) && numero >= 0 ? numero : null
}
