/**
 * Vendor Management API Client
 * All vendor management API calls go through backend API
 */

import { ADMIN_API_URL } from './config'

/**
 * Get all vendors with optional filtering and pagination
 * GET /api/admin/vendors.php
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.status - Filter by status: 'pending', 'active', 'suspended'
 * @param {string} options.role - Filter by role (default: 'vendor')
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50, max: 100)
 * @returns {Promise<Object>} Vendors list with pagination
 */
export async function getAllVendors(options = {}) {
  try {
    const params = new URLSearchParams()
    
    if (options.status && options.status !== 'all') {
      params.append('status', options.status)
    }
    if (options.role) {
      params.append('role', options.role)
    }
    if (options.page) {
      params.append('page', options.page)
    }
    if (options.limit) {
      params.append('limit', options.limit)
    }

    const queryString = params.toString()
    const url = queryString 
      ? `${ADMIN_API_URL}/vendors.php?${queryString}`
      : `${ADMIN_API_URL}/vendors.php`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch vendors')
    }

    return result
  } catch (error) {
    console.error('Error fetching vendors:', error)
    throw error
  }
}

/**
 * Get pending vendors only
 * GET /api/admin/vendors/pending.php
 * 
 * @returns {Promise<Object>} Pending vendors list
 */
export async function getPendingVendors() {
  try {
    const response = await fetch(`${ADMIN_API_URL}/vendors/pending.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch pending vendors')
    }

    return result
  } catch (error) {
    console.error('Error fetching pending vendors:', error)
    throw error
  }
}

/**
 * Approve a vendor
 * POST /api/admin/vendors/approve.php
 * 
 * @param {string} vendorId - Vendor UUID
 * @returns {Promise<Object>} Updated vendor data
 */
export async function approveVendor(vendorId) {
  try {
    const response = await fetch(`${ADMIN_API_URL}/vendors/approve.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vendor_id: vendorId
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to approve vendor')
    }

    return result
  } catch (error) {
    console.error('Error approving vendor:', error)
    throw error
  }
}

/**
 * Update vendor status
 * POST /api/admin/vendors.php
 * 
 * @param {string} vendorId - Vendor UUID
 * @param {string} action - Action: 'approve', 'suspend', or 'activate'
 * @returns {Promise<Object>} Updated vendor data
 */
export async function updateVendorStatus(vendorId, action) {
  try {
    if (!['approve', 'suspend', 'activate'].includes(action)) {
      throw new Error('Invalid action. Must be one of: approve, suspend, activate')
    }

    const response = await fetch(`${ADMIN_API_URL}/vendors.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vendor_id: vendorId,
        action: action
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update vendor status')
    }

    return result
  } catch (error) {
    console.error('Error updating vendor status:', error)
    throw error
  }
}

/**
 * Get vendor statistics
 * GET /api/admin/vendors/stats.php
 * 
 * @returns {Promise<Object>} Vendor statistics
 */
export async function getVendorStats() {
  try {
    const response = await fetch(`${ADMIN_API_URL}/vendors/stats.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch vendor statistics')
    }

    return result
  } catch (error) {
    console.error('Error fetching vendor statistics:', error)
    throw error
  }
}

