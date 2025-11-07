/**
 * Admin Dashboard API client
 * Fetches consolidated dashboard metrics for admin users
 */

import { ADMIN_API_URL } from './config'

/**
 * Fetch the dashboard overview snapshot for admin users.
 * GET /api/admin/dashboard/overview.php
 *
 * @returns {Promise<Object>} Parsed overview response
 */
export async function getAdminDashboardOverview() {
  const response = await fetch(`${ADMIN_API_URL}/dashboard/overview.php`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const result = await response.json()

  if (!response.ok || result.status !== 'success') {
    throw new Error(result.message || 'Failed to fetch admin dashboard overview')
  }

  return result.data
}
