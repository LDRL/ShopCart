import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

import { queryClient } from './api/queryClient'
import { Loading } from './components/Loading'
import { AuthGuard } from './guards'
import { SessionExpiryListener } from './listeners/SessionExpiryListener'
import { LoginPage } from './pages/Login'
import { PrivatePage } from './pages/Private'
import { ProductoDetallePage, PublicPage } from './pages/Public'
import { store, useAppSelector } from './redux'
import { PrivateRoutes, PublicRoutes, RoutesWithNotFound } from './routes'
import { AppTheme } from './theme'

const ToastHost = () => {
  const mode = useAppSelector((state) => state.theme.mode)

  return (
    <ToastContainer
      theme={mode}
      pauseOnHover={false}
      pauseOnFocusLoss={false}
    />
  )
}

function App() {
  return (
    <Suspense fallback={<Loading loading />}>
      <Provider store={store}>
        <AppTheme>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <SessionExpiryListener />
              <RoutesWithNotFound>
                <Route
                  path="/"
                  element={<Navigate to={PrivateRoutes.PRIVATE} replace />}
                />
                <Route path={PublicRoutes.LOGIN} element={<LoginPage />} />
                <Route path={PublicRoutes.PUBLIC} element={<PublicPage />} />
                <Route
                  path={`${PublicRoutes.PRODUCTO}/:id`}
                  element={<ProductoDetallePage />}
                />
                <Route element={<AuthGuard />}>
                  <Route
                    path={`${PrivateRoutes.PRIVATE}/*`}
                    element={<PrivatePage />}
                  />
                </Route>
              </RoutesWithNotFound>
            </BrowserRouter>
          </QueryClientProvider>
          <ToastHost />
        </AppTheme>
      </Provider>
    </Suspense>
  )
}

export default App
