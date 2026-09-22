import { Navigate, Route, Routes } from 'react-router'
import {
  GuestOnly,
  RequireAuth,
} from '@/features/login/components/AuthGuard'
import { LoginPage } from '@/features/login/components/LoginPage'
import { BowlListPage } from '@/features/bowls/components/BowlListPage'
import { BowlRecordPage } from '@/features/bowl-records/components/BowlRecordPage'
import { IndividualRecordPage } from '@/features/individual-records/components/IndividualRecordPage'
import { HomePage } from '@/features/visualization/components/HomePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/bowl-records" element={<BowlRecordPage />} />
        <Route
          path="/individual-records"
          element={<IndividualRecordPage />}
        />
        <Route path="/bowls" element={<BowlListPage />} />
        {/* 未知のパスはホームへ。未ログイン時は RequireAuth が /login へ誘導する */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
