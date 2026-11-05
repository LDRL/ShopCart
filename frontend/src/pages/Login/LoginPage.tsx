import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Navigate } from 'react-router-dom'

import { ThemeToggle } from '../../components/ThemeToggle'
import { useAppSelector } from '../../redux/hooks'
import { PrivateRoutes } from '../../routes'
import { LoginForm } from './components/LoginForm'

export const LoginPage = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken)

  if (accessToken) {
    return <Navigate to={PrivateRoutes.PRIVATE} replace />
  }

  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', py: 6 }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, width: '100%' }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="overline" color="primary">
            ShopCart
          </Typography>
          <ThemeToggle />
        </Stack>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Iniciar sesión
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Ingresá con tu cuenta para administrar la tienda.
        </Typography>
        <LoginForm />
      </Paper>
    </Container>
  )
}
