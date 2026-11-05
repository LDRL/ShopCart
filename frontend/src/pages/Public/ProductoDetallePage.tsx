import { useEffect, useState } from 'react'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '../../api/errors'
import { PublicRoutes } from '../../routes'
import { PublicHeader } from './components/PublicHeader'
import type { FiltroCatalogo } from './domain'
import {
  formatearPrecio,
  imagenPrincipalDeColor,
  imagenesDeColor,
  tallasDeColor,
} from './domain'
import { useCategoriasMenu, useGeneros, useProductoDetalle } from './hooks'

const FILTRO_VACIO: FiltroCatalogo = { idGenero: null, idCategoria: null }

const urlTienda = (filtro: FiltroCatalogo): string => {
  const params = new URLSearchParams()

  if (filtro.idGenero !== null) params.set('genero', String(filtro.idGenero))
  if (filtro.idCategoria !== null) {
    params.set('categoria', String(filtro.idCategoria))
  }

  const query = params.toString()

  return query ? `${PublicRoutes.PUBLIC}?${query}` : PublicRoutes.PUBLIC
}

export const ProductoDetallePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const productoId = Number(id)
  const [idColorSeleccionado, setIdColorSeleccionado] = useState<number | null>(
    null,
  )
  const [imagenSeleccionada, setImagenSeleccionada] = useState<{
    idColor: number | null
    url: string
  } | null>(null)

  const { data: producto, isLoading, error } = useProductoDetalle(productoId)
  const { data: generos = [], isLoading: generosLoading } = useGeneros()
  const { data: categorias = [] } = useCategoriasMenu()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [productoId])

  const colores = producto?.colores ?? []
  const idColor = colores.some((color) => color.id === idColorSeleccionado)
    ? idColorSeleccionado
    : colores[0]?.id ?? null

  const colorActivo = colores.find((color) => color.id === idColor)
  const imagenes = producto ? imagenesDeColor(producto, idColor) : []
  const imagenPrincipal = producto
    ? imagenPrincipalDeColor(producto, idColor)
    : null
  const tallas = producto ? tallasDeColor(producto, idColor) : []

  const imagenVisible =
    imagenSeleccionada?.idColor === idColor &&
    imagenes.some((imagen) => imagen.url === imagenSeleccionada.url)
      ? imagenSeleccionada.url
      : imagenPrincipal?.url ?? null

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader
        generos={generos}
        categorias={categorias}
        isLoading={generosLoading}
        filtro={FILTRO_VACIO}
        onSelect={(filtro) => navigate(urlTienda(filtro))}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          component={RouterLink}
          to={PublicRoutes.PUBLIC}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mb: 2 }}
        >
          Volver a la tienda
        </Button>

        {isLoading ? (
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
            <Box
              sx={{
                display: 'grid',
                gap: 4,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <Skeleton variant="rounded" sx={{ aspectRatio: '1 / 1' }} />
              <Box>
                <Skeleton width="30%" />
                <Skeleton width="80%" height={48} />
                <Skeleton width="40%" height={40} />
                <Skeleton width="100%" />
                <Skeleton width="90%" />
              </Box>
            </Box>
          </Paper>
        ) : error ? (
          <Alert severity="error">
            {getApiErrorMessage(error, 'No se pudo cargar el producto')}
          </Alert>
        ) : !producto ? (
          <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
              Producto no encontrado
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              El producto que buscás no existe o ya no está disponible.
            </Typography>
            <Button component={RouterLink} to={PublicRoutes.PUBLIC} variant="contained">
              Ir a la tienda
            </Button>
          </Paper>
        ) : (
          <Paper
            variant="outlined"
            sx={{ overflow: 'hidden', borderRadius: 3 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
              }}
            >
              <Box sx={{ bgcolor: 'action.hover', p: { xs: 2, md: 4 } }}>
                <Box
                  sx={{
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  {imagenVisible ? (
                    <Box
                      component="img"
                      src={imagenVisible}
                      alt={`${producto.nombre}${
                        colorActivo ? ` - ${colorActivo.nombre}` : ''
                      }`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <ImageNotSupportedRoundedIcon
                      sx={{ fontSize: 96, color: 'text.disabled' }}
                    />
                  )}
                </Box>

                {imagenes.length > 1 ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2, overflowX: 'auto', pb: 0.5 }}
                  >
                    {imagenes.map((imagen) => {
                      const activa = imagen.url === imagenVisible

                      return (
                        <Box
                          key={imagen.id}
                          component="button"
                          type="button"
                          onClick={() =>
                            setImagenSeleccionada({ idColor, url: imagen.url })
                          }
                          aria-label="Ver imagen"
                          aria-pressed={activa}
                          sx={{
                            p: 0,
                            width: 64,
                            height: 64,
                            flexShrink: 0,
                            border: 2,
                            borderColor: activa ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Box
                            component="img"
                            src={imagen.url}
                            alt=""
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </Box>
                      )
                    })}
                  </Stack>
                ) : null}
              </Box>

              <Box sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="overline" color="primary">
                  {[producto.genero, producto.categoria]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>

                <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                  {producto.nombre}
                </Typography>

                <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 700 }}>
                  {formatearPrecio(producto.precio)}
                </Typography>

                {producto.descripcion ? (
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 2, whiteSpace: 'pre-line' }}
                  >
                    {producto.descripcion}
                  </Typography>
                ) : null}

                {producto.colores.length > 0 ? (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle2" component="p">
                      Color
                      {colorActivo ? `: ${colorActivo.nombre}` : ''}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1.25}
                      sx={{ mt: 1.5, flexWrap: 'wrap' }}
                      role="group"
                      aria-label="Seleccionar color"
                    >
                      {producto.colores.map((color) => {
                        const activo = color.id === idColor

                        return (
                          <Tooltip key={color.id} title={color.nombre}>
                            <ButtonBase
                              onClick={() => {
                                setIdColorSeleccionado(color.id)
                                setImagenSeleccionada(null)
                              }}
                              aria-label={color.nombre}
                              aria-pressed={activo}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: color.hex,
                                outline: activo ? '2px solid' : 'none',
                                outlineColor: 'primary.main',
                                outlineOffset: 2,
                              }}
                            />
                          </Tooltip>
                        )
                      })}
                    </Stack>
                  </>
                ) : null}

                {tallas.length > 0 ? (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle2" component="p">
                      Tallas disponibles
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ mt: 1.5, flexWrap: 'wrap' }}
                    >
                      {tallas.map((talla) => (
                        <Tooltip
                          key={talla.id}
                          title={
                            talla.stock > 0
                              ? `${talla.stock} disponibles`
                              : 'Agotada'
                          }
                        >
                          <span>
                            <Chip
                              label={talla.nombre}
                              variant="outlined"
                              disabled={talla.stock <= 0}
                            />
                          </span>
                        </Tooltip>
                      ))}
                    </Stack>
                  </>
                ) : null}
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  )
}
