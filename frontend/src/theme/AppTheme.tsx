import { useLayoutEffect, useMemo, type PropsWithChildren } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'

import { useAppSelector } from '../redux/hooks'
import { THEME_STORAGE_KEY } from '../redux/themeSlice'
import { createAppTheme } from './theme'

export const AppTheme = ({ children }: PropsWithChildren) => {
  const mode = useAppSelector((state) => state.theme.mode)

  const theme = useMemo(() => createAppTheme(mode), [mode])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
