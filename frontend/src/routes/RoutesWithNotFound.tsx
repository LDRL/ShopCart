import type { ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { NotFound } from '../components/NotFound'

interface RoutesWithNotFoundProps {
  children: ReactNode
}

export const RoutesWithNotFound = ({ children, }: RoutesWithNotFoundProps) => (
  <Routes>
    {children}
    <Route path="*" element={<NotFound />} />
  </Routes>
)
