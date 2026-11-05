import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { SESSION_EXPIRED_EVENT } from '../api/authBridge'
import { PublicRoutes } from '../routes'

export const SessionExpiryListener = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSessionExpired = () => {
      toast.info('Tu sesión expiró. Iniciá sesión de nuevo.')
      navigate(PublicRoutes.LOGIN, { replace: true })
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [navigate])

  return null
}
