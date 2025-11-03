import { useState, useEffect } from 'react'
import { getCurrentUser } from '../lib/auth-api'
import { getWalletBalance, submitTopupRequest, getWalletTransactions } from '../lib/wallet-api'

export default function VendorDashboard() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTopUpForm, setShowTopUpForm] = useState(false)
  const [topUpData, setTopUpData] = useState({ amount: '' })
  const [submitting, setSubmitting] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      fetchWallet(user.id)
      fetchTransactions(user.id)
    }
  }, [])

  const fetchWallet = async (vendorId) => {
    setLoading(true)
    setError('')
    try {
      const result = await getWalletBalance(vendorId)
      if (result.status === 'success' && result.data) {
        setWallet(result.data)
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch wallet balance')
      console.error('Error fetching wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (vendorId) => {
    try {
      const result = await getWalletTransactions(vendorId, { limit: 5 })
      if (result.status === 'success' && result.data) {
        setTransactions(result.data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleTopUpRequest = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    const amount = parseFloat(topUpData.amount)
    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amount > 1000000) {
      setError('Amount cannot exceed ₹10,00,000')
      return
    }

    setSubmitting(true)
    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const result = await submitTopupRequest(user.id, amount)

      if (result.status === 'success') {
        setSuccess(result.message || 'Top-up request submitted successfully')
        setShowTopUpForm(false)
        setTopUpData({ amount: '' })
        // Refresh transactions to show new request
        fetchTransactions(user.id)
      }
    } catch (error) {
      setError(error.message || 'Failed to submit top-up request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const user = getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your wallet and view transactions</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold opacity-90 mb-2">Wallet Balance</h2>
                <p className="text-5xl font-bold">
                  ₹{wallet?.balance ? parseFloat(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
                <p className="text-sm opacity-75 mt-2">Available Balance</p>
              </div>
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowTopUpForm(!showTopUpForm)}
              className="w-full mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-200 border border-white/30"
            >
              {showTopUpForm ? 'Cancel Request' : 'Request Top-up'}
            </button>
          </div>

          {/* Recent Transactions Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent transactions</p>
            ) : (
              <ul className="space-y-4">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.transaction_type === 'topup'
                            ? 'bg-green-100 text-green-800'
                            : transaction.transaction_type === 'deduction'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{transaction.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.transaction_type === 'topup'
                          ? 'text-green-600'
                          : transaction.transaction_type === 'deduction'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {transaction.transaction_type === 'topup' ? '+' : '-'}
                        ₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-400">
                        Balance: ₹{parseFloat(transaction.balance_after).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top-up Request Form */}
        {showTopUpForm && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Top-up</h2>
            <form onSubmit={handleTopUpRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  required
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({ ...topUpData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount (max ₹10,00,000)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₹0.01 | Maximum: ₹10,00,000
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTopUpForm(false)
                    setTopUpData({ amount: '' })
                    setError('')
                    setSuccess('')
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
