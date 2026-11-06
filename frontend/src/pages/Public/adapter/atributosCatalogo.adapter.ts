import type { AtributosCatalogo, OpcionColorFiltro, OpcionTallaFiltro, } from '../domain'
import { hexPorNombreColor } from '../domain'
import type { AtributoDto, AtributosResponse, ValorAtributoDto, ValoresAtributoResponse, } from '../models'

const esRol = (rol: string, esperado: string): boolean =>
  rol.trim().toUpperCase() === esperado

const ORDEN_TALLAS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']

const compararTallas = (a: OpcionTallaFiltro, b: OpcionTallaFiltro): number => {
  const numA = Number(a.nombre)
  const numB = Number(b.nombre)

  if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB

  const indiceA = ORDEN_TALLAS.indexOf(a.nombre.trim().toUpperCase())
  const indiceB = ORDEN_TALLAS.indexOf(b.nombre.trim().toUpperCase())

  if (indiceA !== -1 && indiceB !== -1) return indiceA - indiceB
  if (indiceA !== -1) return -1
  if (indiceB !== -1) return 1

  return a.nombre.localeCompare(b.nombre, 'es')
}

const agruparValores = ( valores: ValorAtributoDto[], ): Map<number, ValorAtributoDto[]> => {
  const porAtributo = new Map<number, ValorAtributoDto[]>()

  valores.forEach((valor) => {
    if (!valor.AtributoEstado) return

    const actuales = porAtributo.get(valor.IDAtributo) ?? []
    actuales.push(valor)
    porAtributo.set(valor.IDAtributo, actuales)
  })

  return porAtributo
}

const obtenerColores = ( atributos: AtributoDto[], valoresPorAtributo: Map<number, ValorAtributoDto[]> ): OpcionColorFiltro[] =>
  atributos.filter((atributo) => atributo.estado && esRol(atributo.rol, 'COLOR'))
    .flatMap((atributo) =>
      (valoresPorAtributo.get(atributo.IDAtributo) ?? []).map((valor) => ({
        id: valor.IDValorAtributo,
        idAtributo: atributo.IDAtributo,
        nombre: valor.valor,
        hex: hexPorNombreColor(valor.valor),
      })),
    )

const obtenerTallas = ( atributos: AtributoDto[], valoresPorAtributo: Map<number, ValorAtributoDto[]>, ): OpcionTallaFiltro[] =>
  atributos .filter( (atributo) => atributo.estado && esRol(atributo.rol, 'TALLA'))
    .flatMap((atributo) =>
      (valoresPorAtributo.get(atributo.IDAtributo) ?? []).map((valor) => ({
        id: valor.IDValorAtributo,
        idAtributo: atributo.IDAtributo,
        nombre: valor.valor,
      })),
    )
    .sort(compararTallas)

export const atributosCatalogoAdapter = ( atributosResponse: AtributosResponse, valoresResponse: ValoresAtributoResponse ): AtributosCatalogo => {
  const valoresPorAtributo = agruparValores(valoresResponse.data)

  return {
    colores: obtenerColores(atributosResponse.data, valoresPorAtributo),
    tallas: obtenerTallas(atributosResponse.data, valoresPorAtributo),
  }
}