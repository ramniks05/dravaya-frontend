/**
 * Vendor Payout API Client
 * Handles vendor payouts with beneficiary support and wallet deduction
 */

import { VENDOR_API_URL } from './config'

/**
 * Generate payout merchant reference ID
 * Format: PAYOUT_{timestamp}_{random}
 */
export function generatePayoutReferenceId() {
  const timestamp = Date.now()
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PAYOUT_${timestamp}_${randomChars}`
}

/**
 * Initiate vendor payout
 * POST /api/vendor/payout/initiate.php
 * 
 * Supports two modes:
 * 1. Using saved beneficiary (provide beneficiary_id)
 * 2. Manual entry (provide beneficiary details directly)
 * 
 * @param {Object} payoutData - Payout request data
 * @param {string} payoutData.vendor_id - Vendor UUID
 * @param {number} payoutData.beneficiary_id - Optional: Saved beneficiary ID
 * @param {number} payoutData.amount - Amount to transfer
 * @param {string} payoutData.narration - Optional narration
 * @param {string} payoutData.merchant_reference_id - Optional custom reference ID
 * 
 * OR for manual entry:
 * @param {string} payoutData.transfer_type - UPI, IMPS, or NEFT
 * @param {string} payoutData.ben_name - Beneficiary name
 * @param {string} payoutData.ben_phone_number - 10-digit phone number
 * @param {string} payoutData.ben_vpa_address - UPI address (for UPI)
 * @param {string} payoutData.ben_account_number - Account number (for IMPS/NEFT)
 * @param {string} payoutData.ben_ifsc - IFSC code (for IMPS/NEFT)
 * @param {string} payoutData.ben_bank_name - Bank name (for IMPS/NEFT)
 * 
 * @returns {Promise<Object>} Payout response with transaction and wallet info
 */
export async function initiateVendorPayout(payoutData) {
  try {
    // Prepare payload
    const payload = {
      vendor_id: payoutData.vendor_id,
      amount: parseFloat(payoutData.amount)
    }

        // If using saved beneficiary
    if (payoutData.beneficiary_id !== undefined && payoutData.beneficiary_id !== null) {
      // Ensure beneficiary_id is an integer
      payload.beneficiary_id = parseInt(payoutData.beneficiary_id, 10)
      if (isNaN(payload.beneficiary_id)) {
        throw new Error('Invalid beneficiary_id: must be a valid integer')      
      }
      // Allow override of transfer_type even with saved beneficiary
      if (payoutData.transfer_type) {
        payload.transfer_type = payoutData.transfer_type.toUpperCase()
      }
    } else {
      // Manual entry - transfer type and beneficiary details required
      payload.transfer_type = payoutData.transfer_type
      payload.ben_name = payoutData.ben_name
      payload.ben_phone_number = payoutData.ben_phone_number

      if (payoutData.transfer_type === 'UPI') {
        payload.ben_vpa_address = payoutData.ben_vpa_address
      } else {
        // IMPS or NEFT
        payload.ben_account_number = payoutData.ben_account_number
        payload.ben_ifsc = payoutData.ben_ifsc
        payload.ben_bank_name = payoutData.ben_bank_name
      }
    }

    // Optional fields
    if (payoutData.narration) {
      payload.narration = payoutData.narration
    }

    if (payoutData.merchant_reference_id) {
      payload.merchant_reference_id = payoutData.merchant_reference_id
    }

    console.log('Vendor Payout API Request:', {
      url: `${VENDOR_API_URL}/payout/initiate.php`,
      payload: payload
    })

    const response = await fetch(`${VENDOR_API_URL}/payout/initiate.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    console.log('Vendor Payout API Response:', {
      status: response.status,
      ok: response.ok,
      result: result
    })

    if (!response.ok) {
      throw new Error(result.message || 'Failed to initiate payout')
    }

    return result
  } catch (error) {
    console.error('Error initiating vendor payout:', error)
    throw error
  }
}

