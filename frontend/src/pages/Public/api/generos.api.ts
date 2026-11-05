import { apiClient } from '../../../api/axiosClient'
import type { GenerosResponse } from '../models'

// Sin parametros de paginacion: el backend responde 400 si se envia uno solo.
export const getGeneros = async (): Promise<GenerosResponse> => {
  const { data } = await apiClient.get<GenerosResponse>('/public/generos')

  return data
}
