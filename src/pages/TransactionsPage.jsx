import { useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/auth-api'
import { ADMIN_API_URL, VENDOR_API_URL } from '../lib/config'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(20)

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole) {
      fetchTransactions()
    }
  }, [userRole, typeFilter, statusFilter, currentPage])

  const checkUserRole = async () => {
    try {
      const user = getCurrentUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }
      // Get role from user object or API - adjust based on your auth implementation
      setUserRole(user.role || 'vendor')
    } catch (error) {
      console.error('Error checking user role:', error)
      setUserRole('vendor') // Default fallback
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const user = getCurrentUser()
      if (!user || !user.id) {
        throw new Error('User not authenticated')
      }

      // Build request body
      const requestBody = {
        page: currentPage,
        limit: limit
      }

      // Add vendor_id for vendor role, admin endpoint may ignore it or use it as filter
      if (userRole === 'vendor') {
        requestBody.vendor_id = user.id
      } else if (userRole === 'admin') {
        // Admin can optionally filter by vendor_id, for now get all transactions
        // If needed, you can add vendor filter UI later
      }

      // Add filters if not 'all'
      if (statusFilter !== 'all') {
        requestBody.status = statusFilter.toUpperCase()
      }

      if (typeFilter !== 'all') {
        requestBody.transfer_type = typeFilter.toUpperCase()
      }

      // Determine API endpoint based on role
      const url = userRole === 'admin' 
        ? `${ADMIN_API_URL}/payout/list.php`
        : `${VENDOR_API_URL}/payout/list.php`

      // Use POST request with JSON body
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch transactions')
      }

      if (result.status === 'success' && result.data) {
        // Transform API response to match display format
        const transactionsData = result.data.transactions || []
        const vendorEmail = result.data.vendor_email // For vendor view
        const transformedTransactions = transactionsData.map(t => ({
          id: t.id,
          merchant_reference_id: t.merchant_reference_id,
          payninja_transaction_id: t.payninja_transaction_id,
          utr: t.utr,
          beneficiary_id: t.beneficiary_id,
          beneficiary_name: t.beneficiary?.name,
          beneficiary: t.beneficiary,
          amount: t.transaction?.amount,
          transfer_type: t.transaction?.transfer_type,
          narration: t.transaction?.narration,
          status: t.transaction?.status,
          payment_mode: t.transaction?.payment_mode,
          created_at: t.timestamps?.created_at,
          updated_at: t.timestamps?.updated_at,
          api_error: t.api_error,
          vendor_email: t.vendor_email || vendorEmail, // Include vendor email if available in transaction or data level
          vendor_id: t.vendor_id || result.data.vendor_id
        }))

        setTransactions(transformedTransactions)
        setPagination(result.data.pagination || null)
      } else {
        setTransactions([])
        setPagination(null)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      alert('Error fetching transactions: ' + error.message)
      setTransactions([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Transfer Type</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setCurrentPage(1) // Reset to first page on filter change
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="UPI">UPI</option>
            <option value="IMPS">IMPS</option>
            <option value="NEFT">NEFT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1) // Reset to first page on filter change
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {pagination && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {transactions.length} of {pagination.total} transactions
            {pagination.total_pages > 1 && (
              <span className="ml-2">(Page {pagination.page} of {pagination.total_pages})</span>
            )}
          </div>
          {pagination.total_pages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                disabled={currentPage >= pagination.total_pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'You don\'t have any transactions yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {userRole === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.vendor_email || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono text-xs">
                      {transaction.merchant_reference_id || transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.transfer_type === 'UPI'
                            ? 'bg-purple-100 text-purple-800'
                            : transaction.transfer_type === 'IMPS'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.transfer_type === 'NEFT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {transaction.transfer_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.beneficiary_name || (transaction.beneficiary?.name) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'SUCCESS' || transaction.status === 'success' || transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'PENDING' || transaction.status === 'pending'
                            ? 'bg-gray-100 text-gray-800'
                            : transaction.status === 'PROCESSING' || transaction.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.status === 'REVERSED' || transaction.status === 'reversed'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                      {transaction.utr || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.created_at 
                        ? new Date(transaction.created_at).toLocaleString('en-IN')
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

