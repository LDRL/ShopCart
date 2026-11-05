import { apiClient } from '../../../api/axiosClient'
import type { LoginRequest, LoginResponse } from '../models'

export const loginRequest = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
  return data
}
