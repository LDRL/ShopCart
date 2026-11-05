import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { getSessionUser } from '../../../api/authApi'
import { getApiErrorMessage } from '../../../api/errors'
import { setCredentials } from '../../../redux/authSlice'
import { useAppDispatch } from '../../../redux/hooks'
import { PrivateRoutes } from '../../../routes'
import { toLoginRequest, toSession } from '../adapter'
import type { Credentials } from '..'
import { loginRequest } from '../models'


export const useLogin = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (credentials: Credentials) => {
      const response = await loginRequest(toLoginRequest(credentials))
      const user = await getSessionUser(response.data)

      return toSession(response, user)
    },
    onSuccess: (session) => {
      dispatch(setCredentials(session))
      toast.success(`Bienvenido, ${session.user.nombre}`)
      navigate(PrivateRoutes.PRIVATE, { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo iniciar sesión'))
    },
  })

  const login = async (credentials: Credentials): Promise<void> => {
    try {
      await mutation.mutateAsync(credentials)
    } catch {
      // onError already notified the user.
    }
  }

  return {
    login,
    isLoading: mutation.isPending,
    error: mutation.error
      ? getApiErrorMessage(mutation.error, 'No se pudo iniciar sesión')
      : null,
  }
}
