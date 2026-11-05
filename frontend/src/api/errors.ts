import axios from 'axios'

interface ApiErrorBody {
  error?: string
  msg?: string
  message?: string
}

export const getApiErrorMessage = ( error: unknown, fallback = 'Ocurrió un error inesperado', ): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data

    return body?.error ?? body?.msg ?? body?.message ?? error.message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
