import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Layout from './components/Layout'
import { getCurrentUser } from './lib/auth-api'
import AdminDashboard from './pages/AdminDashboard'
import VendorDashboard from './pages/VendorDashboard'
import VendorsPage from './pages/VendorsPage'
import TopUpRequestsPage from './pages/TopUpRequestsPage'
import TransactionsPage from './pages/TransactionsPage'
import BeneficiariesPage from './pages/BeneficiariesPage'
import PayoutsPage from './pages/PayoutsPage'

function ProtectedRoute({ children, allowedRoles }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = () => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setRole(currentUser.role)
    }
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(role)) return <Navigate to="/login" />
  
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VendorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/topup-requests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TopUpRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/beneficiaries"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <BeneficiariesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/payouts"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <PayoutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/transactions"
          element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
