import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

import { useLogin } from '../hooks'
import { validateCredentials, type Credentials } from '../models/login.domain'

const EMPTY_CREDENTIALS: Credentials = { email: '', password: '' }

export const LoginForm = () => {
  const { login, isLoading, error } = useLogin()
  const [credentials, setCredentials] = useState<Credentials>(EMPTY_CREDENTIALS)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const message = validateCredentials(credentials)

    if (message) {
      setValidationError(message)
      return
    }

    setValidationError(null)
    void login(credentials)
  }

  const handleChange = (field: keyof Credentials, value: string) => {
    setCredentials((previous) => ({ ...previous, [field]: value }))
  }

  const message = validationError ?? error

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Correo"
          type="email"
          autoComplete="email"
          value={credentials.email}
          onChange={(event) => handleChange('email', event.target.value)}
          disabled={isLoading}
          required
        />

        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={credentials.password}
          onChange={(event) => handleChange('password', event.target.value)}
          disabled={isLoading}
          required
        />

        {message ? <Alert severity="error">{message}</Alert> : null}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          {isLoading ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </Stack>
    </Box>
  )
}
