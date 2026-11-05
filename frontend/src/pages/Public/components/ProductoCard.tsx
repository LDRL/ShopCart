import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { PublicRoutes } from '../../../routes'
import type { Producto } from '../domain'
import { formatearPrecio } from '../domain'

interface ProductoCardProps {
  producto: Producto
}

export const ProductoCard = ({ producto }: ProductoCardProps) => {
  const colores = producto.colores
    .map((color) => color.nombre)
    .join(', ')

  return (
    <Paper
      component={RouterLink}
      to={`${PublicRoutes.PRODUCTO}/${producto.id}`}
      variant="outlined"
      aria-label={`Ver ${producto.nombre}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        color: 'inherit',
        textDecoration: 'none',
        transition: 'box-shadow 120ms ease, transform 120ms ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '1 / 1',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {producto.imagen ? (
          <Box
            component="img"
            src={producto.imagen}
            alt={producto.nombre}
            loading="lazy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <ImageNotSupportedRoundedIcon
            sx={{ fontSize: 48, color: 'text.disabled' }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          p: 1.5,
          flex: 1,
        }}
      >
        <Typography variant="overline" color="text.secondary" noWrap>
          {producto.categoria}
        </Typography>

        <Typography
          variant="body2"
          title={producto.nombre}
          sx={{
            fontWeight: 600,
            lineHeight: 1.35,
            minHeight: '2.7em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {producto.nombre}
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {formatearPrecio(producto.precio)}
        </Typography>

        {producto.colores.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.75,
              mt: 0.5,
            }}
            aria-label={`Colores disponibles: ${colores}`}
          >
            {producto.colores.map((color) => (
              <Tooltip key={color.id} title={color.nombre}>
                <Box
                  component="span"
                  role="img"
                  aria-label={color.nombre}
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: color.hex,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ) : null}
      </Box>
    </Paper>
  )
}
