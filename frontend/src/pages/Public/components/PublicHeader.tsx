import { useState, type FocusEvent } from 'react'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link as RouterLink } from 'react-router-dom'

import { ThemeToggle } from '../../../components/ThemeToggle'
import { PublicRoutes } from '../../../routes'
import type { Categoria, FiltroCatalogo, Genero } from '../domain'
import { ETIQUETA_VER_TODO, generoMuestraCategorias } from '../domain'
import { PublicMenuDrawer } from './PublicMenuDrawer'

interface PublicHeaderProps {
  generos: Genero[]
  categorias: Categoria[]
  isLoading: boolean
  filtro: FiltroCatalogo
  onSelect: (filtro: FiltroCatalogo) => void
}

const SKELETON_ROWS = [0, 1, 2]
const MAX_WIDTH = 1200

const colorTexto = 'var(--sidebar-text)'
const colorHover = 'var(--sidebar-hover-bg)'
const colorActivo = 'var(--sidebar-active-bg)'
const colorActivoTexto = 'var(--sidebar-active-color)'
const colorHeaderMovil = '#000000'

export const PublicHeader = ({
  generos,
  categorias,
  isLoading,
  filtro,
  onSelect,
}: PublicHeaderProps) => {
  const [abiertoId, setAbiertoId] = useState<number | null>(null)
  const [carritoEl, setCarritoEl] = useState<HTMLElement | null>(null)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  const theme = useTheme()
  const esMovil = useMediaQuery(theme.breakpoints.down('md'))

  const visibles = generos.filter((genero) => genero.activo)

  const generoAbierto =
    visibles.find(
      (genero) =>
        genero.id === abiertoId && generoMuestraCategorias(genero.nombre),
    ) ?? null

  const seleccionar = (siguiente: FiltroCatalogo) => {
    onSelect(siguiente)
    setAbiertoId(null)
  }

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const siguiente = event.relatedTarget

    if (
      !(siguiente instanceof Node) ||
      !event.currentTarget.contains(siguiente)
    ) {
      setAbiertoId(null)
    }
  }

  return (
    <Box
      component="header"
      onMouseLeave={() => setAbiertoId(null)}
      onBlur={handleBlur}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: esMovil ? colorHeaderMovil : 'var(--sidebar-bg)',
        color: colorTexto,
        borderBottom: '1px solid var(--sidebar-border-color)',
      }}
    >
      <Box
        sx={{
          maxWidth: MAX_WIDTH,
          mx: 'auto',
          px: { xs: 1.5, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          minHeight: 64,
        }}
      >
        <Typography
          variant="h6"
          component={RouterLink}
          to={PublicRoutes.PUBLIC}
          sx={{
            color: colorTexto,
            textDecoration: 'none',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          ShopCart
        </Typography>

        {esMovil ? (
          <Box sx={{ flex: 1 }} />
        ) : (
          <Box
            component="nav"
            aria-label="Géneros"
            sx={{
              display: 'flex',
              alignItems: 'stretch',
              gap: 0.5,
              flex: 1,
              minWidth: 0,
              minHeight: 64,
              overflowX: 'auto',
            }}
          >
            {isLoading
              ? SKELETON_ROWS.map((row) => (
                  <Box
                    key={row}
                    sx={{ display: 'flex', alignItems: 'center', px: 1 }}
                  >
                    <Skeleton width={72} height={24} />
                  </Box>
                ))
              : visibles.map((genero) => {
                  const conCategorias = generoMuestraCategorias(genero.nombre)
                  const seleccionado =
                    filtro.idGenero === genero.id && filtro.idCategoria === null
                  const expandido = generoAbierto?.id === genero.id

                  return (
                    <Button
                      key={genero.id}
                      onClick={() =>
                        seleccionar({ idGenero: genero.id, idCategoria: null })
                      }
                      onMouseEnter={() =>
                        setAbiertoId(conCategorias ? genero.id : null)
                      }
                      onFocus={() =>
                        setAbiertoId(conCategorias ? genero.id : null)
                      }
                      aria-haspopup={conCategorias ? 'true' : undefined}
                      aria-expanded={conCategorias ? expandido : undefined}
                      endIcon={
                        conCategorias ? (
                          <ExpandMoreRoundedIcon
                            sx={{
                              transform: expandido
                                ? 'rotate(180deg)'
                                : 'none',
                              transition: 'transform 120ms ease',
                            }}
                          />
                        ) : undefined
                      }
                      sx={{
                        flexShrink: 0,
                        px: { xs: 1, sm: 1.5 },
                        minHeight: 64,
                        borderRadius: 0,
                        color: seleccionado ? colorActivoTexto : colorTexto,
                        bgcolor: seleccionado ? colorActivo : 'transparent',
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: colorHover },
                        '& .MuiButton-endIcon': { color: 'inherit' },
                      }}
                    >
                      {genero.nombre}
                    </Button>
                  )
                })}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            '& .MuiIconButton-root': { color: colorTexto },
          }}
        >
          {esMovil ? (
            <Tooltip title="Abrir menú">
              <IconButton
                aria-label="Abrir menú"
                aria-expanded={menuMovilAbierto}
                onClick={() => setMenuMovilAbierto(true)}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <ThemeToggle />

              <Tooltip title="Iniciar sesión">
                <IconButton
                  component={RouterLink}
                  to={PublicRoutes.LOGIN}
                  aria-label="Iniciar sesión"
                >
                  <PersonOutlineRoundedIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="Mi carrito">
            <IconButton
              aria-label="Mi carrito"
              onClick={(event) => setCarritoEl(event.currentTarget)}
            >
              <ShoppingCartOutlinedIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={carritoEl}
            open={Boolean(carritoEl)}
            onClose={() => setCarritoEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1.5, maxWidth: 260 }}>
              <Typography variant="subtitle2" component="p">
                Mi carrito
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todavía no agregaste productos.
              </Typography>
            </Box>
          </Menu>
        </Box>
      </Box>

      {!esMovil && generoAbierto ? (
        <Box
          role="menu"
          aria-label={`Categorías de ${generoAbierto.nombre}`}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
            boxShadow: 6,
          }}
        >
          <Box
            sx={{
              maxWidth: MAX_WIDTH,
              mx: 'auto',
              px: { xs: 1.5, sm: 3 },
              py: 2,
            }}
          >
            <Typography
              variant="overline"
              component="p"
              color="text.secondary"
            >
              {generoAbierto.nombre}
            </Typography>

            <ButtonBase
              role="menuitem"
              onClick={() =>
                seleccionar({
                  idGenero: generoAbierto.id,
                  idCategoria: null,
                })
              }
              sx={{
                justifyContent: 'flex-start',
                width: '100%',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                color: 'text.primary',
                fontWeight: 600,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {ETIQUETA_VER_TODO}
            </ButtonBase>

            <Divider sx={{ my: 1 }} />

            {categorias.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Sin categorías disponibles.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.5,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                }}
              >
                {categorias.map((categoria) => {
                  const seleccionada =
                    filtro.idGenero === generoAbierto.id &&
                    filtro.idCategoria === categoria.id

                  return (
                    <ButtonBase
                      key={categoria.id}
                      role="menuitem"
                      onClick={() =>
                        seleccionar({
                          idGenero: generoAbierto.id,
                          idCategoria: categoria.id,
                        })
                      }
                      sx={{
                        justifyContent: 'flex-start',
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        color: seleccionada ? 'primary.main' : 'text.primary',
                        bgcolor: seleccionada ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {categoria.nombre}
                    </ButtonBase>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>
      ) : null}

      <PublicMenuDrawer
        open={esMovil && menuMovilAbierto}
        onClose={() => setMenuMovilAbierto(false)}
        generos={generos}
        categorias={categorias}
        isLoading={isLoading}
        filtro={filtro}
        onSelect={onSelect}
      />
    </Box>
  )
}
