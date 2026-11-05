import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ThemeMode } from '../theme/theme'

export const THEME_STORAGE_KEY = 'shopcart:theme-mode'

interface ThemeState {
  mode: ThemeMode
}

const readStoredMode = (): ThemeMode =>
  localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'

const initialState: ThemeState = {
  mode: readStoredMode(),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions

export default themeSlice.reducer
