import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import Dashboard    from './pages/dashboard/Dashboard'
import Members      from './pages/members/Members'
import Attendance   from './pages/attendance/Attendance'
import Billing      from './pages/billing/Billing'
import Staff        from './pages/staff/Staff'
import Leads        from './pages/leads/Leads'
import WorkoutPlans from './pages/workout/WorkoutPlans'
import Reports      from './pages/reports/Reports'
import Settings     from './pages/settings/Settings'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600/30 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm font-medium">Loading FitGymSoftware®...</p>
        </div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Guard><Layout /></Guard>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="members"    element={<Members />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="billing"    element={<Billing />} />
        <Route path="staff"      element={<Staff />} />
        <Route path="leads"      element={<Leads />} />
        <Route path="workout"    element={<WorkoutPlans />} />
        <Route path="reports"    element={<Reports />} />
        <Route path="settings"   element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
