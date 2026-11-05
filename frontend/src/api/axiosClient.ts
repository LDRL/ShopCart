import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { authBridge } from './authBridge'
import type { TokenResponse } from '../models/session.models'

const API_URL: string = import.meta.env.VITE_API_URL || '/api'

const AUTH_ROUTES = ['/auth/login', '/auth/refresh', '/auth/logout'] as const

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

let refreshPromise: Promise<string> | null = null

export const requestRefresh = (): Promise<string> => {
  refreshPromise ??= refreshClient
    .post<TokenResponse>('/auth/refresh')
    .then(({ data }) => {
      authBridge.setAccessToken(data.data)
      return data.data
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

const isAuthRoute = (url: string | undefined): boolean =>
  AUTH_ROUTES.some((route) => (url ?? '').includes(route))

apiClient.interceptors.request.use((config) => {
  const accessToken = authBridge.getAccessToken()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined
    const status = error.response?.status

    if (
      status !== 401 ||
      !original ||
      original._retry ||
      isAuthRoute(original.url)
    ) {
      return Promise.reject(error)
    }

    const hadSession = authBridge.getAccessToken() !== null
    original._retry = true

    try {
      const accessToken = await requestRefresh()
      original.headers.set('Authorization', `Bearer ${accessToken}`)

      return await apiClient(original)
    } catch (refreshError) {
      if (hadSession) {
        authBridge.notifySessionExpired()
      }

      return Promise.reject(refreshError)
    }
  },
)
