import { apiClient } from '../../../api/axiosClient'
import type { AtributosResponse, ValoresAtributoResponse } from '../models'

// Sin parametros de paginacion: el backend responde 400 si se envia uno solo.
export const getAtributos = async (): Promise<AtributosResponse> => {
  const { data } = await apiClient.get<AtributosResponse>('/public/atributos')

  return data
}

export const getValoresAtributos = async (): Promise<ValoresAtributoResponse> => {
  const { data } = await apiClient.get<ValoresAtributoResponse>(
    '/public/valores-atributos',
  )

  return data
}