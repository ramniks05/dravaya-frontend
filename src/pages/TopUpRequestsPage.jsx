import { useState, useEffect } from 'react'
import { getCurrentUser } from '../lib/auth-api'
import { listTopupRequests, processTopupRequest, getTopupStats } from '../lib/topup-api'

export default function TopUpRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    fetchRequests()
    fetchStats()
  }, [statusFilter])

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listTopupRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100
      })

      if (result.status === 'success' && result.data) {
        setRequests(result.data.requests || [])
        setPagination(result.data.pagination || null)
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch topup requests')
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await getTopupStats()
      if (result.status === 'success' && result.data) {
        setStats(result.data.statistics || result.data.summary)
      }
    } catch (error) {
      console.error('Error fetching topup stats:', error)
    }
  }

  const handleApprove = async (request) => {
    const adminNotes = prompt('Enter admin notes (optional):')
    if (adminNotes === null) return

    const user = getCurrentUser()
    if (!user) {
      alert('You must be logged in as admin')
      return
    }

    setProcessing({ ...processing, [request.request_id]: 'approve' })
    try {
      const result = await processTopupRequest(
        request.request_id,
        'approve',
        user.id,
        adminNotes || null,
        null
      )

      if (result.status === 'success') {
        alert(result.message || 'Request approved successfully')
        fetchRequests()
        fetchStats()
      }
    } catch (error) {
      alert(error.message || 'Failed to approve request')
    } finally {
      setProcessing({ ...processing, [request.request_id]: null })
    }
  }

  const handleReject = async (request) => {
    const rejectionReason = prompt('Enter rejection reason (required):')
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required')
      return
    }

    const user = getCurrentUser()
    if (!user) {
      alert('You must be logged in as admin')
      return
    }

    setProcessing({ ...processing, [request.request_id]: 'reject' })
    try {
      const result = await processTopupRequest(
        request.request_id,
        'reject',
        user.id,
        null,
        rejectionReason
      )

      if (result.status === 'success') {
        alert(result.message || 'Request rejected successfully')
        fetchRequests()
        fetchStats()
      }
    } catch (error) {
      alert(error.message || 'Failed to reject request')
    } finally {
      setProcessing({ ...processing, [request.request_id]: null })
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Top-up Requests</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Requests</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total?.count || 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ₹{(stats.total?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending?.count || 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ₹{(stats.pending?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved?.count || 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ₹{(stats.approved?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected?.count || 0}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ₹{(stats.rejected?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">No requests found</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.vendor_email || 'Unknown Vendor'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Amount:</span>{' '}
                        <span className="text-gray-900">₹{parseFloat(request.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div>
                        <span className="font-medium">Request ID:</span>{' '}
                        <span className="text-gray-900 font-mono text-xs">{request.request_id}</span>
                      </div>
                    </div>
                    {request.vendor_status && (
                      <p className="text-xs text-gray-500 mb-1">
                        Vendor Status: <span className="font-medium">{request.vendor_status}</span>
                      </p>
                    )}
                    {request.admin_notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                      </p>
                    )}
                    {request.rejection_reason && (
                      <p className="text-sm text-red-600 mt-2">
                        <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(request.created_at).toLocaleString()}
                      {request.processed_at && (
                        <> | Processed: {new Date(request.processed_at).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={processing[request.request_id] === 'approve'}
                          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing[request.request_id] === 'approve' ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={processing[request.request_id] === 'reject'}
                          className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing[request.request_id] === 'reject' ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Info */}
          {pagination && pagination.total_pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Showing page {pagination.page} of {pagination.total_pages}
                ({pagination.total} total requests)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
