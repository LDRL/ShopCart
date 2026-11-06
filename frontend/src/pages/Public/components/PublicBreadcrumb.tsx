import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import type { Categoria, FiltroCatalogo, Genero } from '../domain'

interface PublicBreadcrumbProps {
  genero: Genero | undefined
  categoria: Categoria | undefined
  onSelect: (filtro: FiltroCatalogo) => void
}

const enlaceSx = {
  p: 0,
  border: 0,
  bgcolor: 'transparent',
  font: 'inherit',
  cursor: 'pointer',
} as const

/**
 * Ruta de navegacion bajo el header. Solo aparece cuando hay un genero
 * seleccionado: Inicio > Genero, y agrega la categoria si esta activa.
 */
export const PublicBreadcrumb = ({
  genero,
  categoria,
  onSelect,
}: PublicBreadcrumbProps) => {
  if (!genero) return null

  return (
    <Breadcrumbs
      separator=">"
      aria-label="Ruta de navegación"
      sx={{ mb: 3 }}
    >
      <Link
        component="button"
        type="button"
        underline="hover"
        color="inherit"
        onClick={() => onSelect({ idGenero: null, idCategoria: null })}
        sx={enlaceSx}
      >
        Inicio
      </Link>

      {categoria ? (
        <Link
          component="button"
          type="button"
          underline="hover"
          color="inherit"
          onClick={() =>
            onSelect({ idGenero: genero.id, idCategoria: null })
          }
          sx={enlaceSx}
        >
          {genero.nombre}
        </Link>
      ) : (
        <Typography color="text.primary" aria-current="page">
          {genero.nombre}
        </Typography>
      )}

      {categoria ? (
        <Typography color="text.primary" aria-current="page">
          {categoria.nombre}
        </Typography>
      ) : null}
    </Breadcrumbs>
  )
}
