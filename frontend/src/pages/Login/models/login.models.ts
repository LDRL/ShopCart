import type { Session, SessionUser, TokenResponse, } from '../../../models/session.models'

export interface LoginRequest {
  email: string
  contraseña: string
}

export type LoginResponse = TokenResponse

export type { Session, SessionUser, TokenResponse }
