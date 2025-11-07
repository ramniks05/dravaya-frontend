import { useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/auth-api'
import { ADMIN_API_URL, VENDOR_API_URL } from '../lib/config'
import { checkTransactionStatus } from '../lib/payment-api'
import { getAllVendors } from '../lib/vendor-api'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all') // New: vendor email filter
  const [vendors, setVendors] = useState([]) // New: list of vendors for filter
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(20)
  const [checkingStatus, setCheckingStatus] = useState({}) // Track which transaction is being checked

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole) {
      fetchTransactions()
    }
  }, [userRole, typeFilter, statusFilter, vendorFilter, currentPage])

  // Fetch vendors list when admin role is detected
  useEffect(() => {
    if (userRole === 'admin') {
      fetchVendors()
    }
  }, [userRole])

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

  const fetchVendors = async () => {
    try {
      const result = await getAllVendors({
        status: 'active', // Only fetch active vendors for filter
        role: 'vendor',
        limit: 100 // Get all vendors for the filter dropdown
      })

      if (result.status === 'success' && result.data) {
        setVendors(result.data.vendors || [])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      // Don't show error to user, just log it
    }
  }

  const handleCheckStatus = async (merchantReferenceId, transactionId) => {
    // Set loading state for this specific transaction
    setCheckingStatus(prev => ({ ...prev, [transactionId]: true }))

    try {
      const result = await checkTransactionStatus(merchantReferenceId)

      if (result.status === 'success' && result.data) {
        // Show success message
        alert(`Status updated successfully! Status: ${result.data.status}${result.data.utr ? `, UTR: ${result.data.utr}` : ''}`)
        
        // Refresh transactions list to show updated status and UTR
        await fetchTransactions()
      } else {
        throw new Error(result.message || 'Failed to check transaction status')
      }
    } catch (error) {
      console.error('Error checking transaction status:', error)
      alert('Error checking status: ' + (error.message || 'Failed to check transaction status'))
    } finally {
      // Clear loading state for this transaction
      setCheckingStatus(prev => {
        const newState = { ...prev }
        delete newState[transactionId]
        return newState
      })
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
        // Admin can filter by vendor email or vendor_id
        if (vendorFilter !== 'all') {
          // Find vendor_id from email
          const selectedVendor = vendors.find(v => v.email === vendorFilter)
          if (selectedVendor) {
            requestBody.vendor_id = selectedVendor.id
          } else {
            // If vendor not found in list, try using email directly
            requestBody.vendor_email = vendorFilter
          }
        }
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
        
        const transformedTransactions = transactionsData.map(t => {
          // Handle nested structure: beneficiary, transaction, timestamps
          const beneficiary = t.beneficiary || {}
          const transaction = t.transaction || {}
          const timestamps = t.timestamps || {}
          
          // Parse api_response JSON to extract UTR and other details if available
          let utr = t.utr || null
          let parsedApiResponse = null
          
          if (t.api_response) {
            try {
              parsedApiResponse = typeof t.api_response === 'string' 
                ? JSON.parse(t.api_response) 
                : t.api_response
              
              // Extract UTR from api_response if not already in main object
              if (!utr && parsedApiResponse?.data?.utr) {
                utr = parsedApiResponse.data.utr
              }
              
              // Extract transfer_type/mode from api_response if not in transaction object or is empty
              if ((!transaction.transfer_type || transaction.transfer_type.trim() === '') && parsedApiResponse?.data?.mode) {
                transaction.transfer_type = parsedApiResponse.data.mode
              }
            } catch (e) {
              console.warn('Failed to parse api_response:', e)
            }
          }

          // Return only important fields - handle both nested and flat structures
          return {
            id: t.id,
            merchant_reference_id: t.merchant_reference_id,
            payninja_transaction_id: t.payninja_transaction_id || null,
            utr: utr || null,
            beneficiary_id: t.beneficiary_id,
            beneficiary_name: beneficiary.name || t.ben_name || null,
            amount: parseFloat(transaction.amount || t.amount || 0),
            transfer_type: (transaction.transfer_type && transaction.transfer_type.trim() !== '') 
              ? transaction.transfer_type 
              : (t.transfer_type && t.transfer_type.trim() !== '') 
                ? t.transfer_type 
                : null,
            narration: transaction.narration || t.narration || null,
            status: transaction.status || t.status || null,
            api_error: t.api_error || null,
            vendor_email: t.vendor_email || vendorEmail || null,
            vendor_id: t.vendor_id || result.data.vendor_id || null,
            created_at: timestamps.created_at || t.created_at || null,
            updated_at: timestamps.updated_at || t.updated_at || null
          }
        })

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

  const filtersApplied = typeFilter !== 'all' || statusFilter !== 'all' || vendorFilter !== 'all'

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
            <p className="text-sm text-slate-500">Monitor payouts, statuses and beneficiary details.</p>
          </div>
          {pagination && (
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-600">
              <span>Total</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-slate-900 shadow-sm">{pagination.total}</span>
            </div>
          )}
        </div>
      </section>

      <section className={`grid grid-cols-1 gap-4 lg:grid-cols-3 ${userRole === 'admin' ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        {userRole === 'admin' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</label>
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.email}>
                  {vendor.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer Type</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Types</option>
            <option value="UPI">UPI</option>
            <option value="IMPS">IMPS</option>
            <option value="NEFT">NEFT</option>
          </select>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </section>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 4h10M5 11h14M5 15h14M5 19h10" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-slate-800">No transactions found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {filtersApplied
              ? 'Try adjusting your filters to find specific records.'
              : 'Once payouts are initiated they will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {transactions.map((transaction) => {
              const status = (transaction.status || '').toUpperCase()
              const statusClass =
                status === 'SUCCESS'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'PENDING'
                  ? 'bg-amber-100 text-amber-700'
                  : status === 'PROCESSING'
                  ? 'bg-sky-100 text-sky-700'
                  : status === 'REVERSED'
                  ? 'bg-orange-100 text-orange-700'
                  : status === 'FAILED'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-600'

              const transferType = (transaction.transfer_type || '').toUpperCase()
              const typeClass =
                transferType === 'UPI'
                  ? 'bg-purple-100 text-purple-700'
                  : transferType === 'IMPS'
                  ? 'bg-blue-100 text-blue-700'
                  : transferType === 'NEFT'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'

              return (
                <article key={transaction.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reference ID</p>
                      <p className="mt-1 font-semibold text-slate-900">{transaction.merchant_reference_id || transaction.id}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                      {transaction.status || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Amount</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Transfer Type</p>
                      <span className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${typeClass}`}>
                        {transaction.transfer_type || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Beneficiary</p>
                      <p className="mt-1 font-medium text-slate-700">{transaction.beneficiary_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">UTR</p>
                      <p className="mt-1 font-medium text-slate-700">{transaction.utr || '-'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <p>{transaction.created_at ? new Date(transaction.created_at).toLocaleString('en-IN') : '-'}</p>
                    <div className="flex items-center gap-2">
                      {userRole === 'admin' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {transaction.vendor_email || 'N/A'}
                        </span>
                      )}
                      {!transaction.utr || transaction.utr === '-' ? (
                        <button
                          onClick={() => handleCheckStatus(transaction.merchant_reference_id, transaction.id)}
                          disabled={checkingStatus[transaction.id]}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {checkingStatus[transaction.id] ? 'Checking…' : 'Check Status'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          UTR Available
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {userRole === 'admin' && <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</th>}
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reference ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Beneficiary</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">UTR</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => {
                    const status = (transaction.status || '').toUpperCase()
                    const statusClass =
                      status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-700'
                        : status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : status === 'PROCESSING'
                        ? 'bg-sky-100 text-sky-700'
                        : status === 'REVERSED'
                        ? 'bg-orange-100 text-orange-700'
                        : status === 'FAILED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'

                    const transferType = (transaction.transfer_type || '').toUpperCase()
                    const typeClass =
                      transferType === 'UPI'
                        ? 'bg-purple-100 text-purple-700'
                        : transferType === 'IMPS'
                        ? 'bg-blue-100 text-blue-700'
                        : transferType === 'NEFT'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'

                    return (
                      <tr key={transaction.id} className="hover:bg-slate-50/60">
                        {userRole === 'admin' && (
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                            {transaction.vendor_email || 'Unknown'}
                          </td>
                        )}
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {transaction.merchant_reference_id || transaction.id}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${typeClass}`}>
                            {transaction.transfer_type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          ₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{transaction.beneficiary_name || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                            {transaction.status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{transaction.utr || '-'}</td>
                        <td className="px-6 py-4 text-slate-500">{transaction.created_at ? new Date(transaction.created_at).toLocaleString('en-IN') : '-'}</td>
                        <td className="px-6 py-4">
                          {!transaction.utr || transaction.utr === '-' || transaction.utr === null ? (
                            <button
                              onClick={() => handleCheckStatus(transaction.merchant_reference_id, transaction.id)}
                              disabled={checkingStatus[transaction.id]}
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                checkingStatus[transaction.id]
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {checkingStatus[transaction.id] ? (
                                <>
                                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                                    <path d="M12 3a9 9 0 018.485 12.485" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Checking…
                                </>
                              ) : (
                                'Check Status'
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              UTR Available
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <span className="text-slate-500">
                Page <span className="font-semibold text-slate-800">{pagination.page}</span> of {pagination.total_pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.total_pages, prev + 1))}
                  disabled={currentPage >= pagination.total_pages}
                  className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

