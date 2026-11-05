import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { toggleTheme } from '../../redux/themeSlice'

export const ThemeToggle = () => {
  const mode = useAppSelector((state) => state.theme.mode)
  const dispatch = useAppDispatch()

  const isLight = mode === 'light'
  const label = isLight ? 'Activar modo oscuro' : 'Activar modo claro'

  return (
    <Tooltip title={label}>
      <IconButton
        onClick={() => dispatch(toggleTheme())}
        aria-label={label}
        color="primary"
      >
        {isLight ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  )
}
