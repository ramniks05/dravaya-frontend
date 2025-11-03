/**
 * Configuration file
 * Update these values for production
 */

// Backend API URLs
// Development: http://localhost/backend/api
// Production: Update to your production server URL

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/backend/api'

export const BACKEND_API_URL = `${API_BASE}/payout`
export const AUTH_API_URL = `${API_BASE}/auth`
export const ADMIN_API_URL = `${API_BASE}/admin`
export const VENDOR_API_URL = `${API_BASE}/vendor`

// For easier switching between dev and production
export const API_CONFIG = {
  development: {
    base: 'http://localhost/backend/api',
    payout: 'http://localhost/backend/api/payout',
    auth: 'http://localhost/backend/api/auth',
    admin: 'http://localhost/backend/api/admin',
    vendor: 'http://localhost/backend/api/vendor'
  },
  production: {
    base: 'https://your-domain.com/backend/api',
    payout: 'https://your-domain.com/backend/api/payout',
    auth: 'https://your-domain.com/backend/api/auth',
    admin: 'https://your-domain.com/backend/api/admin',
    vendor: 'https://your-domain.com/backend/api/vendor'
  }
}
