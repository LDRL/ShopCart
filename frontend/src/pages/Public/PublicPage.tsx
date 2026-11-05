import { useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '../../api/errors'
import { ProductosGrid } from './components/ProductosGrid'
import { PublicHeader } from './components/PublicHeader'
import type { FiltroCatalogo } from './domain'
import { PRODUCTOS_POR_PAGINA } from './domain'
import { useCategoriasMenu, useGeneros, useProductos } from './hooks'

const parseId = (value: string | null): number | null => {
  if (!value) return null

  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0 ? id : null
}

const filtroDesdeParams = (params: URLSearchParams): FiltroCatalogo => ({
  idGenero: parseId(params.get('genero')),
  idCategoria: parseId(params.get('categoria')),
})

export const PublicPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pagina, setPagina] = useState(1)
  const [busqueda, setBusqueda] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState<FiltroCatalogo>(() =>
    filtroDesdeParams(searchParams),
  )

  const { data, isLoading, isFetching, error } = useProductos({
    pagina,
    registrosPorPagina: PRODUCTOS_POR_PAGINA,
    idGenero: filtro.idGenero,
    idCategoria: filtro.idCategoria,
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

  const titulo =
    categoriaActiva?.nombre ?? generoActivo?.nombre ?? 'Todos los productos'

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPagina(1)
    setBuscar(busqueda.trim())
  }

  const handleSelect = (siguiente: FiltroCatalogo) => {
    setFiltro(siguiente)
    setPagina(1)

    const params = new URLSearchParams()

    if (siguiente.idGenero !== null) {
      params.set('genero', String(siguiente.idGenero))
    }

    if (siguiente.idCategoria !== null) {
      params.set('categoria', String(siguiente.idCategoria))
    }

    setSearchParams(params, { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader
        generos={generos}
        categorias={categoriasMenu}
        isLoading={generosLoading}
        filtro={filtro}
        onSelect={handleSelect}
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
            slotProps={{ htmlInput: { 'aria-label': 'Buscar producto' } }}
          />
          <Button type="submit" variant="contained">
            Buscar
          </Button>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(error, 'No se pudieron cargar los productos')}
          </Alert>
        ) : null}

        <ProductosGrid
          productos={data?.productos ?? []}
          paginacion={data?.paginacion}
          isLoading={isLoading || isFetching}
          onPageChange={setPagina}
        />
      </Container>
    </Box>
  )
}
