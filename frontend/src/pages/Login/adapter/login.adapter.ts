
import type { Credentials, LoginRequest, LoginResponse, Session, SessionUser } from '../models'

export const toLoginRequest = (credentials: Credentials): LoginRequest => ({
  email: credentials.email.trim(),
  contraseña: credentials.password,
})

export const toSession = (
  response: LoginResponse,
  user: SessionUser,
): Session => ({
  accessToken: response.data,
  user,
})
