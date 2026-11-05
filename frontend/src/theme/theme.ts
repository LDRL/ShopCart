import { createTheme, type Theme } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

const FONT_FAMILY = [
  'Inter',
  'system-ui',
  'Segoe UI',
  'Roboto',
  'sans-serif',
].join(',')

// Mirrors the design tokens in src/styles/color.css.
const lightPalette = {
  primary: { main: '#1976d2', dark: '#1565c0', light: '#42a5f5' },
  secondary: { main: '#ec4899', dark: '#db2777', light: '#f472b6' },
  success: { main: '#16a34a' },
  error: { main: '#dc2626' },
  background: { default: '#f8fafc', paper: '#ffffff' },
  text: { primary: '#111827', secondary: '#6b7280' },
  divider: 'rgba(17, 24, 39, 0.12)',
}

const darkPalette = {
  primary: { main: '#64b5f6', dark: '#42a5f5', light: '#90caf9' },
  secondary: { main: '#f472b6', dark: '#ec4899', light: '#f9a8d4' },
  success: { main: '#4ade80' },
  error: { main: '#f87171' },
  background: { default: '#111827', paper: '#1f2937' },
  text: { primary: '#f9fafb', secondary: '#9ca3af' },
  divider: 'rgba(255, 255, 255, 0.12)',
}

export const createAppTheme = (mode: ThemeMode): Theme => {
  const colors = mode === 'dark' ? darkPalette : lightPalette

  return createTheme({
    palette: {
      mode,
      ...colors,
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: FONT_FAMILY,
      h1: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      overline: { fontWeight: 700, letterSpacing: '0.12em' },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
      },
    },
  })
}
