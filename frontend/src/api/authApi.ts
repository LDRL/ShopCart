import { apiClient, requestRefresh } from './axiosClient'
import type { SessionUser } from '../models/session.models'

export const refreshRequest = (): Promise<string> => requestRefresh()

export const getSessionUser = async ( accessToken: string, ): Promise<SessionUser> => {
  const { data } = await apiClient.get<SessionUser>('/auth/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return data
}

export const logoutRequest = async (): Promise<void> => {
  await apiClient.post('/auth/logout')
}
