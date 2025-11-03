/**
 * Beneficiary Management API Client (Vendor)
 * All beneficiary API calls go through backend API
 */

import { VENDOR_API_URL } from './config'

/**
 * Create a new beneficiary
 * POST /api/vendor/beneficiaries/create.php
 * 
 * @param {Object} beneficiaryData - Beneficiary data
 * @param {string} beneficiaryData.vendor_id - Vendor UUID
 * @param {string} beneficiaryData.name - Beneficiary name
 * @param {string} beneficiaryData.phone_number - 10-digit Indian mobile number
 * @param {string} beneficiaryData.transfer_type - UPI, IMPS, or NEFT
 * @param {string} beneficiaryData.vpa_address - UPI ID (required for UPI)
 * @param {string} beneficiaryData.account_number - Account number (required for IMPS/NEFT)
 * @param {string} beneficiaryData.ifsc - IFSC code (required for IMPS/NEFT)
 * @param {string} beneficiaryData.bank_name - Bank name (required for IMPS/NEFT)
 * @param {boolean} beneficiaryData.is_active - Active status (default: true)
 * @returns {Promise<Object>} Created beneficiary data
 */
export async function createBeneficiary(beneficiaryData) {
  try {
    const response = await fetch(`${VENDOR_API_URL}/beneficiaries/create.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(beneficiaryData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create beneficiary')
    }

    return result
  } catch (error) {
    console.error('Error creating beneficiary:', error)
    throw error
  }
}

/**
 * List all beneficiaries for a vendor
 * GET /api/vendor/beneficiaries/list.php
 * 
 * @param {string} vendorId - Vendor UUID
 * @param {Object} options - Query parameters
 * @param {string} options.transfer_type - Filter by type: UPI, IMPS, NEFT
 * @param {boolean} options.is_active - Filter by active status
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50, max: 100)
 * @returns {Promise<Object>} Beneficiaries list with pagination
 */
export async function listBeneficiaries(vendorId, options = {}) {
  try {
    const params = new URLSearchParams({
      vendor_id: vendorId
    })

    if (options.transfer_type) {
      params.append('transfer_type', options.transfer_type)
    }
    if (options.is_active !== undefined) {
      params.append('is_active', options.is_active)
    }
    if (options.page) {
      params.append('page', options.page)
    }
    if (options.limit) {
      params.append('limit', options.limit)
    }

    const response = await fetch(`${VENDOR_API_URL}/beneficiaries/list.php?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch beneficiaries')
    }

    return result
  } catch (error) {
    console.error('Error fetching beneficiaries:', error)
    throw error
  }
}

/**
 * Get beneficiary by ID
 * GET /api/vendor/beneficiaries/get.php
 * 
 * @param {number} id - Beneficiary ID
 * @param {string} vendorId - Vendor UUID
 * @returns {Promise<Object>} Beneficiary data
 */
export async function getBeneficiary(id, vendorId) {
  try {
    const params = new URLSearchParams({
      id: id.toString(),
      vendor_id: vendorId
    })

    const response = await fetch(`${VENDOR_API_URL}/beneficiaries/get.php?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch beneficiary')
    }

    return result
  } catch (error) {
    console.error('Error fetching beneficiary:', error)
    throw error
  }
}

/**
 * Update beneficiary
 * POST /api/vendor/beneficiaries/update.php
 * 
 * @param {Object} beneficiaryData - Updated beneficiary data
 * @param {number} beneficiaryData.id - Beneficiary ID
 * @param {string} beneficiaryData.vendor_id - Vendor UUID
 * @param {string} beneficiaryData.name - Beneficiary name (optional)
 * @param {string} beneficiaryData.phone_number - Phone number (optional)
 * @param {string} beneficiaryData.transfer_type - Transfer type (optional)
 * @param {string} beneficiaryData.vpa_address - UPI address (optional, for UPI)
 * @param {string} beneficiaryData.account_number - Account number (optional, for IMPS/NEFT)
 * @param {string} beneficiaryData.ifsc - IFSC code (optional, for IMPS/NEFT)
 * @param {string} beneficiaryData.bank_name - Bank name (optional, for IMPS/NEFT)
 * @param {boolean} beneficiaryData.is_active - Active status (optional)
 * @returns {Promise<Object>} Updated beneficiary data
 */
export async function updateBeneficiary(beneficiaryData) {
  try {
    const response = await fetch(`${VENDOR_API_URL}/beneficiaries/update.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(beneficiaryData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update beneficiary')
    }

    return result
  } catch (error) {
    console.error('Error updating beneficiary:', error)
    throw error
  }
}

/**
 * Delete beneficiary
 * POST /api/vendor/beneficiaries/delete.php
 * 
 * @param {number} id - Beneficiary ID
 * @param {string} vendorId - Vendor UUID
 * @returns {Promise<Object>} Success response
 */
export async function deleteBeneficiary(id, vendorId) {
  try {
    const response = await fetch(`${VENDOR_API_URL}/beneficiaries/delete.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        vendor_id: vendorId
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete beneficiary')
    }

    return result
  } catch (error) {
    console.error('Error deleting beneficiary:', error)
    throw error
  }
}

