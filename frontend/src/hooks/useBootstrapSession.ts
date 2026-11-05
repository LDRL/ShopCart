import { useEffect, useRef } from 'react'

import { getSessionUser, refreshRequest } from '../api/authApi'
import type { Session } from '../models/session.models'
import { setCredentials, setStatus } from '../redux/authSlice'
import { useAppDispatch, useAppSelector } from '../redux/hooks'

let bootstrapRequest: Promise<Session | null> | null = null

const requestBootstrap = (): Promise<Session | null> => {
  bootstrapRequest ??= refreshRequest()
    .then(async (accessToken) => ({
      accessToken,
      user: await getSessionUser(accessToken),
    }))
    .catch(() => null)

  return bootstrapRequest
}

export const useBootstrapSession = (): void => {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const statusAtMount = useRef(status)

  useEffect(() => {
    if (statusAtMount.current !== 'idle') {
      return
    }

    let active = true

    dispatch(setStatus('checking'))

    void requestBootstrap().then((session) => {
      if (!active) {
        return
      }

      if (session) {
        dispatch(setCredentials(session))
        return
      }

      dispatch(setStatus('unauthenticated'))
    })

    return () => {
      active = false
    }
  }, [dispatch])
}
