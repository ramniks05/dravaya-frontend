import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getCartItemCount } from '../lib/cart-utils'

export default function EcommerceLayout({ children }) {
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Update cart count
    const updateCartCount = () => {
      setCartCount(getCartItemCount())
    }
    
    updateCartCount()
    
    // Listen for storage changes (when cart is updated in other tabs)
    window.addEventListener('storage', updateCartCount)
    
    // Custom event for cart updates within same tab
    window.addEventListener('cartUpdated', updateCartCount)
    
    // Poll for cart changes (fallback)
    const interval = setInterval(updateCartCount, 1000)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
      clearInterval(interval)
    }
  }, [location])

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">DravyaTech</div>
              <span className="text-sm text-gray-500 hidden sm:inline">Electronics</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/category/speakers"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/category/speakers' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Speakers
              </Link>
              <Link
                to="/category/watches"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/category/watches' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Watches
              </Link>
              <Link
                to="/category/headphones"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/category/headphones' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Headphones
              </Link>
            </nav>

            {/* Right side - Cart and Menu */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/category/speakers"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/category/speakers' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Speakers
                </Link>
                <Link
                  to="/category/watches"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/category/watches' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Watches
                </Link>
                <Link
                  to="/category/headphones"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/category/headphones' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  Headphones
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">DravyaTech</h3>
              <p className="text-gray-400 text-sm">
                Premium electronic gadgets for your lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/category/speakers" className="hover:text-white transition-colors">
                    Speakers
                  </Link>
                </li>
                <li>
                  <Link to="/category/watches" className="hover:text-white transition-colors">
                    Watches
                  </Link>
                </li>
                <li>
                  <Link to="/category/headphones" className="hover:text-white transition-colors">
                    Headphones
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2025 DravyaTech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
