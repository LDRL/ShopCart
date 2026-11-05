export interface SessionUser {
  IDUsuario: number
  nombre: string
  correo: string
  IDRol: number
  estado: boolean
}

export interface Session {
  accessToken: string
  user: SessionUser
}

export interface TokenResponse {
  msg: string
  data: string
}
