import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Pagination from '@mui/material/Pagination'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { Loading } from '../../../components/Loading'
import type { Categoria } from '../domain'
import type { Paginacion } from '../models'

interface CategoriasListProps {
  categorias: Categoria[]
  paginacion?: Paginacion
  isLoading: boolean
  onPageChange: (pagina: number) => void
}

export const CategoriasList = ({
  categorias,
  paginacion,
  isLoading,
  onPageChange,
}: CategoriasListProps) => {
  if (isLoading && categorias.length === 0) {
    return <Loading loading />
  }

  if (categorias.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay categorías para mostrar.
        </Typography>
      </Paper>
    )
  }

  const pagina = paginacion?.pagina ?? 1
  const totalPaginas = Math.max(1, paginacion?.totalPaginas ?? 1)
  const totalRegistros = paginacion?.totalRegistros ?? categorias.length

  return (
    <Stack spacing={2}>
      {isLoading ? <LinearProgress /> : null}

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 640 }} aria-busy={isLoading}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de creación</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id} hover>
                  <TableCell>{categoria.id}</TableCell>
                  <TableCell>{categoria.nombre}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={categoria.activa ? 'Activa' : 'Inactiva'}
                      color={categoria.activa ? 'success' : 'default'}
                      variant={categoria.activa ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(categoria.fechaCreacion).toLocaleDateString(
                      'es-GT',
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
          {totalRegistros} registro{totalRegistros === 1 ? '' : 's'} · página{' '}
          {pagina} de {totalPaginas}
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
