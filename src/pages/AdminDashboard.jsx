import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getAccountBalance } from '../lib/payment-api'
import { getVendorStats } from '../lib/vendor-api'
import { getTopupStats } from '../lib/topup-api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingRequests: 0,
    totalBalance: 0,
    payninjaBalance: null,
  })
  const [loading, setLoading] = useState(true)
  const [loadingPayninjaBalance, setLoadingPayninjaBalance] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchPayninjaBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch vendor statistics from API
      try {
        const vendorStatsResult = await getVendorStats()
        if (vendorStatsResult.status === 'success' && vendorStatsResult.data?.statistics) {
          const vendorStats = vendorStatsResult.data.statistics
          setStats(prev => ({
            totalVendors: vendorStats.total || 0,
            activeVendors: vendorStats.active || 0,
            pendingRequests: prev.pendingRequests, // Keep existing or fetch from another API
            totalBalance: prev.totalBalance, // Keep existing or fetch from another API
            payninjaBalance: prev.payninjaBalance,
          }))
        }
      } catch (vendorError) {
        console.error('Error fetching vendor stats from API:', vendorError)
        // Fallback to supabase if API fails
      }

      // Pending top-up requests from API
      try {
        const topupStatsResult = await getTopupStats()
        if (topupStatsResult.status === 'success' && topupStatsResult.data?.statistics) {
          const topupStats = topupStatsResult.data.statistics
          setStats(prev => ({
            ...prev,
            pendingRequests: topupStats.pending?.count || 0
          }))
        }
      } catch (error) {
        console.error('Error fetching topup stats:', error)
        // Fallback to supabase if API fails
        try {
          const { count: pendingRequests } = await supabase
            .from('top_up_requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
          setStats(prev => ({
            ...prev,
            pendingRequests: pendingRequests || 0
          }))
        } catch (fallbackError) {
          console.error('Error fetching pending requests from fallback:', fallbackError)
        }
      }

      // Total balance across all wallets (still using supabase until API is ready)
      try {
        const { data: wallets } = await supabase.from('wallets').select('balance')
        const totalBalance = wallets?.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0) || 0
        setStats(prev => ({
          ...prev,
          totalBalance: totalBalance
        }))
      } catch (error) {
        console.error('Error fetching total balance:', error)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayninjaBalance = async () => {
    setLoadingPayninjaBalance(true)
    try {
      const response = await getAccountBalance()
      if (response.status === 'success' && response.data?.balance !== undefined) {
        setStats(prev => ({
          ...prev,
          payninjaBalance: parseFloat(response.data.balance)
        }))
      } else {
        alert('Failed to fetch PayNinja balance: ' + (response.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error fetching PayNinja balance:', error)
      alert('Error fetching PayNinja balance: ' + error.message)
    } finally {
      setLoadingPayninjaBalance(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Overview of the vendor payout system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Total Vendors */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{stats.totalVendors}</p>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-2">Total Vendors</p>
          </div>

          {/* Active Vendors */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{stats.activeVendors}</p>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-2">Active Vendors</p>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-2">Pending Requests</p>
          </div>

          {/* Total Balance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-600 mr-1">₹</span>
              <p className="text-4xl font-bold text-gray-900">{parseFloat(stats.totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-2">Total Balance</p>
          </div>
        </div>

        {/* PayNinja Account Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold opacity-90 mb-1">PayNinja Account Balance</h3>
                <p className="text-4xl font-bold">
                  {stats.payninjaBalance !== null ? (
                    `₹${parseFloat(stats.payninjaBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  ) : (
                    <span className="text-xl opacity-75">Not loaded</span>
                  )}
                </p>
                <p className="text-sm opacity-75 mt-1">Balance from PayNinja API</p>
              </div>
            </div>
            <button
              onClick={fetchPayninjaBalance}
              disabled={loadingPayninjaBalance}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-white/30"
            >
              {loadingPayninjaBalance ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Balance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
