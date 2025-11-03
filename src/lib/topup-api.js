/**
 * Topup Management API Client (Admin)
 * All topup management API calls go through backend API
 */

import { ADMIN_API_URL } from './config'

/**
 * List all topup requests with optional filtering
 * GET /api/admin/topup/list.php
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.status - Filter by status: 'pending', 'approved', 'rejected'
 * @param {string} options.vendorId - Filter by vendor ID
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50, max: 100)
 * @returns {Promise<Object>} Topup requests list with pagination
 */
export async function listTopupRequests(options = {}) {
  try {
    const params = new URLSearchParams()

    if (options.status && options.status !== 'all') {
      params.append('status', options.status)
    }
    if (options.vendorId) {
      params.append('vendor_id', options.vendorId)
    }
    if (options.page) {
      params.append('page', options.page)
    }
    if (options.limit) {
      params.append('limit', options.limit)
    }

    const queryString = params.toString()
    const url = queryString
      ? `${ADMIN_API_URL}/topup/list.php?${queryString}`
      : `${ADMIN_API_URL}/topup/list.php`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch topup requests')
    }

    return result
  } catch (error) {
    console.error('Error fetching topup requests:', error)
    throw error
  }
}

/**
 * Approve or reject a topup request
 * POST /api/admin/topup/approve.php
 * 
 * @param {string} requestId - Topup request ID
 * @param {string} action - Action: 'approve' or 'reject'
 * @param {string} adminId - Admin UUID (who is processing)
 * @param {string} adminNotes - Optional admin notes (for approved requests)
 * @param {string} rejectionReason - Optional rejection reason (for rejected requests)
 * @returns {Promise<Object>} Updated topup request data
 */
export async function processTopupRequest(requestId, action, adminId, adminNotes = null, rejectionReason = null) {
  try {
    if (!['approve', 'reject'].includes(action)) {
      throw new Error('Invalid action. Must be either "approve" or "reject"')
    }

    const payload = {
      request_id: requestId,
      action: action,
      admin_id: adminId
    }

    if (adminNotes) {
      payload.admin_notes = adminNotes
    }

    if (rejectionReason) {
      payload.rejection_reason = rejectionReason
    }

    const response = await fetch(`${ADMIN_API_URL}/topup/approve.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to process topup request')
    }

    return result
  } catch (error) {
    console.error('Error processing topup request:', error)
    throw error
  }
}

/**
 * Get topup request statistics
 * GET /api/admin/topup/stats.php
 * 
 * @returns {Promise<Object>} Topup statistics
 */
export async function getTopupStats() {
  try {
    const response = await fetch(`${ADMIN_API_URL}/topup/stats.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch topup statistics')
    }

    return result
  } catch (error) {
    console.error('Error fetching topup statistics:', error)
    throw error
  }
}

