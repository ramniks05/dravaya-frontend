/**
 * Payment API Client
 * All API calls go through backend API
 */

import { BACKEND_API_URL } from './config'

/**
 * Generate merchant reference ID in format: VND{first8charsOfVendorId}{timestamp}{random6chars}
 */
export function generateMerchantReferenceId(vendorId) {
  const first8chars = vendorId?.substring(0, 8) || 'VENDOR'
  const timestamp = Date.now()
  const random6chars = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `VND${first8chars}${timestamp}${random6chars}`
}

/**
 * Initiate fund transfer to beneficiary
 * POST /api/payout/initiate.php
 * 
 * @param {Object} transferData - Fund transfer request data
 * @param {Object} transferData.beneficiary - Beneficiary details
 * @param {number} transferData.amount - Amount to transfer
 * @param {string} transferData.mode - Payment mode: UPI, IMPS, or NEFT
 * @param {string} transferData.merchantReferenceId - Merchant reference ID
 * @param {string} transferData.narration - Optional narration
 * @returns {Promise<Object>} Transfer response
 */
export async function initiateFundTransfer(transferData) {
  try {
    // Prepare request payload
    const payload = {
      ben_name: transferData.beneficiary.name,
      ben_phone_number: String(transferData.beneficiary.phoneNumber),
      amount: String(transferData.amount),
      merchant_reference_id: transferData.merchantReferenceId,
      transfer_type: transferData.mode,
      narration: transferData.narration || 'PAYNINJA Fund Transfer'
    }

    // Add mode-specific fields
    if (transferData.mode === 'UPI') {
      payload.ben_vpa_address = transferData.beneficiary.vpaAddress
    } else {
      payload.ben_account_number = String(transferData.beneficiary.accountNumber)
      payload.ben_ifsc = transferData.beneficiary.ifsc
      payload.ben_bank_name = transferData.beneficiary.bankName
    }

    // Call backend API: POST /api/payout/initiate.php
    const response = await fetch(`${BACKEND_API_URL}/initiate.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Fund transfer request failed')
    }

    return result
  } catch (error) {
    console.error('Error initiating fund transfer:', error)
    throw error
  }
}

/**
 * Check transaction status
 * POST /api/payout/status.php
 * 
 * @param {string} merchantReferenceId - Merchant reference ID
 * @returns {Promise<Object>} Transaction status response
 */
export async function checkTransactionStatus(merchantReferenceId) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/status.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_reference_id: merchantReferenceId
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to check transaction status')
    }

    return result
  } catch (error) {
    console.error('Error checking transaction status:', error)
    throw error
  }
}

/**
 * Get PayNinja account balance
 * GET /api/payout/balance.php
 * 
 * @returns {Promise<Object>} Account balance response
 */
export async function getAccountBalance() {
  try {
    // Call backend API: GET /api/payout/balance.php
    const response = await fetch(`${BACKEND_API_URL}/balance.php`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get account balance')
    }

    return result
  } catch (error) {
    console.error('Error getting account balance:', error)
    throw error
  }
}

/**
 * Poll transaction status until it's no longer processing
 * @param {string} merchantReferenceId - Merchant reference ID
 * @param {number} maxAttempts - Maximum polling attempts (default: 60)
 * @param {number} intervalMs - Polling interval in milliseconds (default: 2000)
 * @returns {Promise<Object>} Final transaction status
 */
export async function pollTransactionStatus(merchantReferenceId, maxAttempts = 60, intervalMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await checkTransactionStatus(merchantReferenceId)
      
      // Check if transaction is still processing
      if (result.status !== 'processing' && result.status !== 'pending') {
        return result
      }

      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    } catch (error) {
      console.error(`Error polling transaction status (attempt ${attempt + 1}):`, error)
      // Continue polling on error
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    }
  }

  throw new Error('Transaction status polling timeout')
}

/**
 * Handle webhook callback (for future use)
 * @param {Object} webhookData - Webhook payload from PayNinja
 * @returns {Object} Processed webhook data
 */
export function handleWebhook(webhookData) {
  // Webhook handling can be implemented here if needed
  // For now, just return the data
  return webhookData
}
