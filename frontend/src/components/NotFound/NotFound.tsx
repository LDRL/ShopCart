import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { PublicRoutes } from '../../routes'

export const NotFound = () => (
  <Container
    maxWidth="sm"
    sx={{ minHeight: '100svh', display: 'grid', placeItems: 'center', py: 6 }}
  >
    <Paper
      variant="outlined"
      sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', width: '100%' }}
    >
      <Typography variant="overline" color="primary">
        Error 404
      </Typography>
      <Typography variant="h4" component="h1" sx={{ mt: 1, mb: 1 }}>
        Página no encontrada
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        La ruta que buscás no existe.
      </Typography>
      <Button component={RouterLink} to={PublicRoutes.LOGIN} variant="contained">
        Volver al inicio de sesión
      </Button>
    </Paper>
  </Container>
)
