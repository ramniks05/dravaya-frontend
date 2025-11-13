import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Layout from './components/Layout'
import EcommerceLayout from './components/EcommerceLayout'
import { getCurrentUser } from './lib/auth-api'
import AdminDashboard from './pages/AdminDashboard'
import VendorDashboard from './pages/VendorDashboard'
import VendorsPage from './pages/VendorsPage'
import TopUpRequestsPage from './pages/TopUpRequestsPage'
import TransactionsPage from './pages/TransactionsPage'
import BeneficiariesPage from './pages/BeneficiariesPage'
import PayoutsPage from './pages/PayoutsPage'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'

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
  if (!user) return <Navigate to="/vendor" />
  if (!allowedRoles.includes(role)) return <Navigate to="/vendor" />
  
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <Router>
      <Routes>
        {/* E-commerce Routes */}
        <Route
          path="/"
          element={
            <EcommerceLayout>
              <HomePage />
            </EcommerceLayout>
          }
        />
        <Route
          path="/category/:category"
          element={
            <EcommerceLayout>
              <CategoryPage />
            </EcommerceLayout>
          }
        />
        <Route
          path="/products/:id"
          element={
            <EcommerceLayout>
              <ProductDetailPage />
            </EcommerceLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <EcommerceLayout>
              <CartPage />
            </EcommerceLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <EcommerceLayout>
              <CheckoutPage />
            </EcommerceLayout>
          }
        />
        <Route
          path="/order-success"
          element={
            <EcommerceLayout>
              <OrderSuccessPage />
            </EcommerceLayout>
          }
        />

        {/* Vendor/Admin Login */}
        <Route path="/vendor" element={<Login />} />
        <Route path="/login" element={<Navigate to="/vendor" replace />} />
        
        {/* Admin Routes */}
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
        
        {/* Vendor Routes */}
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
      </Routes>
    </Router>
  )
}

export default App
