export interface Credentials {
  email: string
  password: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateCredentials = (credentials: Credentials): string | null => {
  if (!credentials.email.trim()) {
    return 'El correo es obligatorio'
  }

  if (!EMAIL_PATTERN.test(credentials.email.trim())) {
    return 'El correo no es válido'
  }

  if (!credentials.password) {
    return 'La contraseña es obligatoria'
  }

  return null
}
