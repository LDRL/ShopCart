import { useState } from 'react'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

import { ThemeToggle } from '../../../components/ThemeToggle'
import { PublicRoutes } from '../../../routes'
import type { Categoria, FiltroCatalogo, Genero } from '../domain'
import {
  ETIQUETA_TODOS,
  ETIQUETA_VER_TODO,
  generoMuestraCategorias,
} from '../domain'

interface PublicMenuDrawerProps {
  open: boolean
  onClose: () => void
  generos: Genero[]
  categorias: Categoria[]
  isLoading: boolean
  filtro: FiltroCatalogo
  onSelect: (filtro: FiltroCatalogo) => void
}

const SKELETON_ROWS = [0, 1, 2]

export const PublicMenuDrawer = ({
  open,
  onClose,
  generos,
  categorias,
  isLoading,
  filtro,
  onSelect,
}: PublicMenuDrawerProps) => {
  const [expandidoId, setExpandidoId] = useState<number | null>(null)

  const visibles = generos.filter((genero) => genero.activo)

  const seleccionar = (siguiente: FiltroCatalogo) => {
    onSelect(siguiente)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="left"
      slotProps={{
        paper: {
          sx: {
            width: 300,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRight: 1,
            borderColor: 'divider',
          },
        },
      }}
    >
      <Typography
        variant="overline"
        component="p"
        color="text.secondary"
        sx={{ px: 2, pt: 2 }}
      >
        Géneros
      </Typography>

      <List disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading
          ? SKELETON_ROWS.map((row) => (
              <Box key={row} sx={{ px: 2, py: 1 }}>
                <Skeleton height={24} />
              </Box>
            ))
          : (
              <>
                <ListItemButton
                  selected={filtro.idGenero === null}
                  onClick={() =>
                    seleccionar({ idGenero: null, idCategoria: null })
                  }
                >
                  <ListItemText primary={ETIQUETA_TODOS} />
                </ListItemButton>

                {visibles.map((genero) => {
              const conCategorias = generoMuestraCategorias(genero.nombre)
              const expandido = expandidoId === genero.id
              const seleccionado =
                filtro.idGenero === genero.id && filtro.idCategoria === null

              return (
                <Box key={genero.id}>
                  <ListItemButton
                    selected={seleccionado}
                    onClick={() => {
                      if (!conCategorias) {
                        seleccionar({
                          idGenero: genero.id,
                          idCategoria: null,
                        })
                        return
                      }

                      setExpandidoId((actual) =>
                        actual === genero.id ? null : genero.id,
                      )
                    }}
                    aria-expanded={conCategorias ? expandido : undefined}
                  >
                    <ListItemText primary={genero.nombre} />
                    {conCategorias ? (
                      <ExpandMoreRoundedIcon
                        fontSize="small"
                        sx={{
                          color: 'text.secondary',
                          transform: expandido ? 'rotate(180deg)' : 'none',
                          transition: 'transform 120ms ease',
                        }}
                      />
                    ) : null}
                  </ListItemButton>

                  {conCategorias ? (
                    <Collapse in={expandido} timeout="auto" unmountOnExit>
                      <List dense disablePadding sx={{ pb: 1 }}>
                        <ListItemButton
                          onClick={() =>
                            seleccionar({
                              idGenero: genero.id,
                              idCategoria: null,
                            })
                          }
                          sx={{ pl: 4 }}
                        >
                          <ListItemText
                            primary={ETIQUETA_VER_TODO}
                            slotProps={{
                              primary: { sx: { fontWeight: 600 } },
                            }}
                          />
                        </ListItemButton>

                        {categorias.length === 0 ? (
                          <Box sx={{ px: 4, py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Sin categorías disponibles.
                            </Typography>
                          </Box>
                        ) : (
                          categorias.map((categoria) => {
                            const activa =
                              filtro.idGenero === genero.id &&
                              filtro.idCategoria === categoria.id

                            return (
                              <ListItemButton
                                key={categoria.id}
                                selected={activa}
                                onClick={() =>
                                  seleccionar({
                                    idGenero: genero.id,
                                    idCategoria: categoria.id,
                                  })
                                }
                                sx={{ pl: 4 }}
                              >
                                <ListItemText primary={categoria.nombre} />
                              </ListItemButton>
                            )
                          })
                        )}
                      </List>
                    </Collapse>
                  ) : null}
                </Box>
              )
            })}
              </>
            )}
      </List>

      <Divider />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          '& .MuiIconButton-root': { color: 'text.primary' },
        }}
      >
        <Tooltip title="Iniciar sesión">
          <IconButton
            component={RouterLink}
            to={PublicRoutes.LOGIN}
            aria-label="Iniciar sesión"
          >
            <PersonOutlineRoundedIcon />
          </IconButton>
        </Tooltip>

        <ThemeToggle />
      </Box>
    </Drawer>
  )
}
