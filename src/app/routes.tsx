import { Route, Routes } from 'react-router'
import {
  GuestOnly,
  RequireAuth,
} from '@/features/auth/components/AuthGuard'
import { HomePlaceholderPage } from '@/features/auth/components/HomePlaceholderPage'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { BowlListPage } from '@/features/bowls/components/BowlListPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePlaceholderPage />} />
        <Route path="/bowls" element={<BowlListPage />} />
      </Route>
    </Routes>
  )
}
