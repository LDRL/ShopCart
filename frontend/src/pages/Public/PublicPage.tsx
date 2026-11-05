import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { getApiErrorMessage } from '../../api/errors'
import { ThemeToggle } from '../../components/ThemeToggle'
import { PublicRoutes } from '../../routes'
import { CategoriasList } from './components/CategoriasList'
import { useCategorias } from './hooks'

const REGISTROS_POR_PAGINA = 10

export const PublicPage = () => {
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [buscar, setBuscar] = useState('')

  const { data, isLoading, isFetching, error } = useCategorias({
    pagina,
    registrosPorPagina: REGISTROS_POR_PAGINA,
    buscar,
  })

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPagina(1)
    setBuscar(busqueda.trim())
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
            Tienda pública
          </Typography>
          <Typography variant="h4" component="h1">
            Categorías
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ThemeToggle />
          <Button
            component={RouterLink}
            to={PublicRoutes.LOGIN}
            variant="outlined"
          >
            Iniciar sesión
          </Button>
        </Stack>
      </Stack>

      <Box
        component="form"
        onSubmit={handleSearch}
        role="search"
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}
      >
        <TextField
          placeholder="Buscar por nombre…"
          size="small"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          sx={{ flex: '1 1 280px', maxWidth: 420 }}
          slotProps={{ htmlInput: { 'aria-label': 'Buscar categoría' } }}
        />
        <Button type="submit" variant="contained">
          Buscar
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(error, 'No se pudieron cargar las categorías')}
        </Alert>
      ) : null}

      <CategoriasList
        categorias={data?.categorias ?? []}
        paginacion={data?.paginacion}
        isLoading={isLoading || isFetching}
        onPageChange={setPagina}
      />
    </Container>
  )
}
