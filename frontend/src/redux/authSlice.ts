import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Session, SessionUser } from '../models/session.models'

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  accessToken: string | null
  user: SessionUser | null
  status: AuthStatus
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<Session>) => {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.status = 'authenticated'
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
    setStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.user = null
      state.status = 'unauthenticated'
    },
  },
})

export const { setCredentials, setAccessToken, setStatus, clearCredentials } =
  authSlice.actions

export default authSlice.reducer
