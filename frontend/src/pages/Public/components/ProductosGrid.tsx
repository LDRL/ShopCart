import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Pagination from '@mui/material/Pagination'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Producto } from '../domain'
import { PRODUCTOS_POR_PAGINA } from '../domain'
import type { Paginacion } from '../models'
import { ProductoCard } from './ProductoCard'

interface ProductosGridProps {
  productos: Producto[]
  paginacion?: Paginacion
  isLoading: boolean
  onPageChange: (pagina: number) => void
}

const SKELETON_CARDS = Array.from({ length: 8 }, (_, index) => index)

const gridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
} as const

export const ProductosGrid = ({
  productos,
  paginacion,
  isLoading,
  onPageChange,
}: ProductosGridProps) => {
  if (isLoading && productos.length === 0) {
    return (
      <Box sx={gridSx} aria-busy="true" aria-label="Cargando productos">
        {SKELETON_CARDS.map((card) => (
          <Box key={card}>
            <Skeleton variant="rounded" sx={{ aspectRatio: '1 / 1' }} />
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </Box>
        ))}
      </Box>
    )
  }

  if (productos.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay productos para mostrar.
        </Typography>
      </Paper>
    )
  }

  const pagina = paginacion?.pagina ?? 1
  const totalPaginas = Math.max(1, paginacion?.totalPaginas ?? 1)
  const totalRegistros = paginacion?.totalRegistros ?? productos.length

  return (
    <Stack spacing={2}>
      {isLoading ? <LinearProgress /> : null}

      <Box sx={gridSx} aria-busy={isLoading}>
        {productos.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {totalRegistros} producto{totalRegistros === 1 ? '' : 's'} · página{' '}
          {pagina} de {totalPaginas} · {PRODUCTOS_POR_PAGINA} por página
        </Typography>
        <Pagination
          count={totalPaginas}
          page={pagina}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          disabled={isLoading}
          showFirstButton
          showLastButton
        />
      </Box>
    </Stack>
  )
}
