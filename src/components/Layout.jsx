import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, logout as logoutUser } from '../lib/auth-api'

const adminNavigation = [
  { name: 'Dashboard', to: '/admin/dashboard', description: 'Overview, metrics and quick actions' },
  { name: 'Vendors', to: '/admin/vendors', description: 'Manage vendor accounts and statuses' },
  { name: 'Top-up Requests', to: '/admin/topup-requests', description: 'Review and process wallet top-ups' },
  { name: 'Transactions', to: '/admin/transactions', description: 'Inspect payouts and wallet activity' }
]

const vendorNavigation = [
  { name: 'Dashboard', to: '/vendor/dashboard', description: 'Wallet balance and quick shortcuts' },
  { name: 'Beneficiaries', to: '/vendor/beneficiaries', description: 'Manage payout recipients' },
  { name: 'Send Payout', to: '/vendor/payouts', description: 'Initiate payouts to beneficiaries' },
  { name: 'Transactions', to: '/vendor/transactions', description: 'Track your payout history' }
]

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setRole(currentUser.role || '')
    } else {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const navigation = role === 'admin' ? adminNavigation : role === 'vendor' ? vendorNavigation : []

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white/95 backdrop-blur shadow-xl transition-transform duration-300 ease-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col border-r border-slate-100">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">DravyaTech</p>
              <p className="mt-1 text-lg font-bold text-slate-900">Vendor Payouts</p>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Hello,</p>
              <p className="truncate text-slate-700">{user?.email || 'User'}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-blue-500">{role || 'Member'}</p>
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-3 pb-6">
            {navigation.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group block rounded-xl border px-4 py-3 transition-all ${
                    active
                      ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-transparent bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className={`mt-1 text-xs leading-relaxed ${active ? 'text-blue-600/90' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                </Link>
              )
            })}
          </nav>

          <div className="px-4 pb-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m9 0l-3-3m3 3l-3 3" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5" />
                </svg>
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">{role || 'Member'}</p>
                <p className="text-lg font-semibold text-slate-900">{navigation.find((item) => location.pathname === item.to)?.name || 'Dashboard'}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 text-right">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.email || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                {user?.email ? user.email.charAt(0).toUpperCase() : '?'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
