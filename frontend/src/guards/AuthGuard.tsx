import { Navigate, Outlet } from 'react-router-dom'

import { Loading } from '../components/Loading'
import { useBootstrapSession } from '../hooks/useBootstrapSession'
import { useAppSelector } from '../redux/hooks'
import { PublicRoutes } from '../routes'

export const AuthGuard = () => {
  useBootstrapSession()

  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const status = useAppSelector((state) => state.auth.status)

  if (status === 'idle' || status === 'checking') {
    return <Loading loading />
  }

  if (!accessToken) {
    return <Navigate to={PublicRoutes.LOGIN} replace />
  }

  return <Outlet />
}
