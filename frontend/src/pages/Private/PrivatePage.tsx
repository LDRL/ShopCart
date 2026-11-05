import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { logoutRequest } from '../../api/authApi'
import { queryClient } from '../../api/queryClient'
import { ThemeToggle } from '../../components/ThemeToggle'
import { clearCredentials } from '../../redux/authSlice'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { PublicRoutes } from '../../routes'

export const PrivatePage = () => {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } catch {
      // The local session is cleared even if the server call fails.
    }

    queryClient.clear()
    dispatch(clearCredentials())
    navigate(PublicRoutes.LOGIN, { replace: true })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="overline" color="primary">
            Panel privado
          </Typography>
          <Typography variant="h4" component="h1">
            Hola, {user?.nombre ?? 'usuario'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ThemeToggle />
          <Button variant="outlined" onClick={() => void handleLogout()}>
            Cerrar sesión
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Sesión activa
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Usuario <strong>{user?.correo}</strong> · rol {user?.IDRol}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Los módulos privados (productos, inventario, pedidos, cupones y
          dashboard) se montan como rutas hijas de{' '}
          <Box
            component="code"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          >
            /dashboard
          </Box>
          .
        </Typography>
        <Button component={RouterLink} to={PublicRoutes.PUBLIC}>
          Ver categorías públicas
        </Button>
      </Paper>
    </Container>
  )
}
