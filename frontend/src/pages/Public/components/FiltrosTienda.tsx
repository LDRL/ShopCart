import { useId, useState, type ReactNode } from 'react'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { AtributosCatalogo, FiltrosCatalogo, OpcionColorFiltro, OpcionTallaFiltro, } from '../domain'

interface FiltrosTiendaProps {
  catalogo: AtributosCatalogo
  seleccion: FiltrosCatalogo
  isLoading: boolean
  onToggleColor: (id: number) => void
  onToggleTalla: (id: number) => void
  onPrecioChange: (
    campo: 'precioDesde' | 'precioHasta',
    valor: string,
  ) => void
  onLimpiar: () => void
}

interface SeccionFiltroProps {
  titulo: string
  abierta: boolean
  onToggle: () => void
  children: ReactNode
}

const SeccionFiltro = ({
  titulo,
  abierta,
  onToggle,
  children,
}: SeccionFiltroProps) => {
  const id = useId()
  const contenidoId = `${id}-contenido`

  return (
    <Box>
      <ButtonBase
        onClick={onToggle}
        aria-expanded={abierta}
        aria-controls={contenidoId}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          px: 0.5,
          py: 1.5,
          borderRadius: 1,
          color: 'text.primary',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {titulo}
        </Typography>
        <ExpandMoreRoundedIcon
          fontSize="small"
          sx={{
            color: 'text.secondary',
            transform: abierta ? 'rotate(180deg)' : 'none',
            transition: 'transform 120ms ease',
          }}
        />
      </ButtonBase>

      <Collapse in={abierta} timeout="auto" unmountOnExit>
        <Box id={contenidoId} sx={{ pb: 1.5 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}

const OpcionColor = ({ color, activo, onToggle}: 
  {
  color: OpcionColorFiltro
  activo: boolean
  onToggle: () => void
}) => (
  <ButtonBase
    onClick={onToggle}
    aria-label={color.nombre}
    aria-pressed={activo}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 1,
      width: '100%',
      px: 1,
      py: 0.75,
      borderRadius: 1,
      border: '1px solid',
      borderColor: activo ? 'primary.main' : 'transparent',
      bgcolor: activo ? 'action.selected' : 'transparent',
      color: 'text.primary',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    <Box
      component="span"
      sx={{
        width: 18,
        height: 18,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: color.hex,
        border: '1px solid',
        borderColor: 'divider',
      }}
    />
    <Typography variant="body2" sx={{ fontWeight: activo ? 600 : 400 }}>
      {color.nombre}
    </Typography>
  </ButtonBase>
)

const OpcionTalla = ({ talla, activa, onToggle
}: {
  talla: OpcionTallaFiltro
  activa: boolean
  onToggle: () => void
}) => (
  <Chip
    label={talla.nombre}
    clickable
    onClick={onToggle}
    aria-pressed={activa}
    variant={activa ? 'filled' : 'outlined'}
    color={activa ? 'primary' : 'default'}
  />
)

const soloDecimales = (valor: string): string =>
  valor.replace(/[^\d.,]/g, '')

export const FiltrosTienda = ({
  catalogo,
  seleccion,
  isLoading,
  onToggleColor,
  onToggleTalla,
  onPrecioChange,
  onLimpiar,
}: FiltrosTiendaProps) => {
  const [colorAbierto, setColorAbierto] = useState(true)
  const [tallaAbierta, setTallaAbierta] = useState(true)

  return (
    <Paper
      variant="outlined"
      component="aside"
      aria-label="Filtros de productos"
      sx={{
        p: 2,
        //borderRadius: 2,
        border:0,
        position: { md: 'sticky' },
        top: { md: 88 },
      }}
    >
      <Typography
        variant="subtitle1"
        component="h2"
        sx={{ fontWeight: 800, letterSpacing: '0.08em' }}
      >
        FILTRAR
      </Typography>

      <Divider sx={{ mt: 1, mb: 0.5 }} />

      <SeccionFiltro
        titulo="Color"
        abierta={colorAbierto}
        onToggle={() => setColorAbierto((actual) => !actual)}
      >
        {isLoading ? (
          <Stack spacing={0.75}>
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} height={28} />
            ))}
          </Stack>
        ) : catalogo.colores.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin colores disponibles.
          </Typography>
        ) : (
          <Stack spacing={0.25}>
            {catalogo.colores.map((color) => (
              <OpcionColor
                key={color.id}
                color={color}
                activo={seleccion.colores.includes(color.id)}
                onToggle={() => onToggleColor(color.id)}
              />
            ))}
          </Stack>
        )}
      </SeccionFiltro>

      <Divider />

      <SeccionFiltro
        titulo="Talla"
        abierta={tallaAbierta}
        onToggle={() => setTallaAbierta((actual) => !actual)}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[0, 1, 2, 3, 4].map((chip) => (
              <Skeleton key={chip} variant="rounded" width={48} height={32} />
            ))}
          </Box>
        ) : catalogo.tallas.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Sin tallas disponibles.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {catalogo.tallas.map((talla) => (
              <OpcionTalla
                key={talla.id}
                talla={talla}
                activa={seleccion.tallas.includes(talla.id)}
                onToggle={() => onToggleTalla(talla.id)}
              />
            ))}
          </Box>
        )}
      </SeccionFiltro>

      <Divider />

      <Box sx={{ pt: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Precio
        </Typography>

        <Stack spacing={1.25}>
          <TextField
            label="Desde (Q)"
            size="small"
            fullWidth
            value={seleccion.precioDesde}
            onChange={(event) =>
              onPrecioChange('precioDesde', soloDecimales(event.target.value))
            }
            slotProps={{
              htmlInput: {
                inputMode: 'decimal',
                'aria-label': 'Precio desde',
              },
            }}
          />
          <TextField
            label="Hasta (Q)"
            size="small"
            fullWidth
            value={seleccion.precioHasta}
            onChange={(event) =>
              onPrecioChange('precioHasta', soloDecimales(event.target.value))
            }
            slotProps={{
              htmlInput: {
                inputMode: 'decimal',
                'aria-label': 'Precio hasta',
              },
            }}
          />
        </Stack>

        <Button fullWidth variant="outlined" onClick={onLimpiar} sx={{ mt: 2 }}>
          Limpiar
        </Button>
      </Box>
    </Paper>
  )
}
