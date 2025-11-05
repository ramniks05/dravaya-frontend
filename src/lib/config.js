/**
 * Configuration file
 * Automatically uses live API in production, local API in development
 */

// Backend API URLs
// Development: http://localhost/backend/api
// Production: http://dravya.hrntechsolutions.com/api

// Auto-detect production environment
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'

// Use environment variable if set, otherwise use live API for production, local for development
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (isProduction 
    ? 'http://dravya.hrntechsolutions.com/api'
    : 'http://localhost/backend/api')

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
    base: 'http://dravya.hrntechsolutions.com/api',
    payout: 'http://dravya.hrntechsolutions.com/api/payout',
    auth: 'http://dravya.hrntechsolutions.com/api/auth',
    admin: 'http://dravya.hrntechsolutions.com/api/admin',
    vendor: 'http://dravya.hrntechsolutions.com/api/vendor'
  }
}
