/**
 * Wallet Management API Client (Vendor)
 * All wallet API calls go through backend API
 */

import { VENDOR_API_URL } from './config'

/**
 * Get wallet balance for a vendor
 * GET /api/vendor/wallet/balance.php
 * 
 * @param {string} vendorId - Vendor UUID
 * @returns {Promise<Object>} Wallet balance data
 */
export async function getWalletBalance(vendorId) {
  try {
    const response = await fetch(`${VENDOR_API_URL}/wallet/balance.php?vendor_id=${vendorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch wallet balance')
    }

    return result
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    throw error
  }
}

/**
 * Submit topup request
 * POST /api/vendor/topup/request.php
 * 
 * @param {string} vendorId - Vendor UUID
 * @param {number} amount - Amount to topup (must be > 0 and <= 10,00,000)
 * @param {string} requestId - Optional custom request ID (auto-generated if not provided)
 * @returns {Promise<Object>} Topup request response
 */
export async function submitTopupRequest(vendorId, amount, requestId = null) {
  try {
    const payload = {
      vendor_id: vendorId,
      amount: parseFloat(amount)
    }

    if (requestId) {
      payload.request_id = requestId
    }

    const response = await fetch(`${VENDOR_API_URL}/topup/request.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit topup request')
    }

    return result
  } catch (error) {
    console.error('Error submitting topup request:', error)
    throw error
  }
}

/**
 * Get wallet transaction history
 * GET /api/vendor/wallet/transactions.php
 * 
 * @param {string} vendorId - Vendor UUID
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50, max: 100)
 * @returns {Promise<Object>} Transaction history with pagination
 */
export async function getWalletTransactions(vendorId, options = {}) {
  try {
    const params = new URLSearchParams({
      vendor_id: vendorId
    })

    if (options.page) {
      params.append('page', options.page)
    }
    if (options.limit) {
      params.append('limit', options.limit)
    }

    const response = await fetch(`${VENDOR_API_URL}/wallet/transactions.php?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch wallet transactions')
    }

    return result
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    throw error
  }
}

