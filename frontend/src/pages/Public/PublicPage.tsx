import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { getApiErrorMessage } from '../../api/errors'
import { CategoriasList } from './components/CategoriasList'
import { PublicHeader } from './components/PublicHeader'
import type { FiltroCatalogo } from './domain'
import { useCategorias, useCategoriasMenu, useGeneros } from './hooks'

const REGISTROS_POR_PAGINA = 10

const FILTRO_INICIAL: FiltroCatalogo = { idGenero: null, idCategoria: null }

export const PublicPage = () => {
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState<FiltroCatalogo>(FILTRO_INICIAL)

  const { data, isLoading, isFetching, error } = useCategorias({
    pagina,
    registrosPorPagina: REGISTROS_POR_PAGINA,
    buscar,
  })

  const {
    data: generos = [],
    isLoading: generosLoading,
    error: generosError,
  } = useGeneros()

  const { data: categoriasMenu = [] } = useCategoriasMenu()

  const generoActivo = generos.find((genero) => genero.id === filtro.idGenero)
  const categoriaActiva = categoriasMenu.find(
    (categoria) => categoria.id === filtro.idCategoria,
  )

  const titulo = categoriaActiva?.nombre ?? generoActivo?.nombre ?? 'Categorías'

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPagina(1)
    setBuscar(busqueda.trim())
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader
        generos={generos}
        categorias={categoriasMenu}
        isLoading={generosLoading}
        filtro={filtro}
        onSelect={(siguiente) => {
          setFiltro(siguiente)
          setPagina(1)
        }}
      />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" color="primary">
            Tienda pública
          </Typography>
          <Typography variant="h4" component="h1">
            {titulo}
          </Typography>
        </Box>

        {generosError ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {getApiErrorMessage(
              generosError,
              'No se pudieron cargar los géneros',
            )}
          </Alert>
        ) : null}

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
    </Box>
  )
}
