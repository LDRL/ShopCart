import { configureStore } from '@reduxjs/toolkit'

import { registerAuthBridge, SESSION_EXPIRED_EVENT } from '../api/authBridge'
import authReducer, { clearCredentials, setAccessToken } from './authSlice'
import themeReducer from './themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

registerAuthBridge({
  getAccessToken: () => store.getState().auth.accessToken,
  setAccessToken: (accessToken) => {
    store.dispatch(setAccessToken(accessToken))
  },
  notifySessionExpired: () => {
    store.dispatch(clearCredentials())
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  },
})
