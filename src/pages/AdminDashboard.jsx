import { useEffect, useState } from 'react'
import { getAdminDashboardOverview } from '../lib/admin-dashboard-api'

const STATUS_COLORS = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-rose-100 text-rose-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  REVERSED: 'bg-orange-100 text-orange-700'
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

function formatCount(value) {
  if (value === null || value === undefined) {
    return '—'
  }
  return Number(value).toLocaleString('en-IN')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', { hour12: false })
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadOverview({ showLoader: true })
  }, [])

  const loadOverview = async ({ showLoader = false } = {}) => {
    if (showLoader) {
      setLoading(true)
      setError(null)
    }

    try {
      const data = await getAdminDashboardOverview()
      setOverview(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch admin dashboard overview:', err)
      setError(err.message || 'Unable to load dashboard overview')
    } finally {
      if (showLoader) {
        setLoading(false)
      }
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOverview()
  }

  const payninjaBalance = overview?.payninja_balance || null
  const vendorStatusCounts = overview?.vendor_status_counts || {}
  const vendorWallets = overview?.vendor_wallets || []
  const recentTransactions = overview?.recent_transactions || []
  const topVendors = overview?.top_vendors || []
  const transactionStats = overview?.transaction_stats || {}

  const summaryCards = [
    {
      label: 'Total Vendors',
      value: formatCount(vendorStatusCounts.total),
      description: 'Registered vendor accounts',
      accent: 'text-slate-900',
      chip: null
    },
    {
      label: 'Active Vendors',
      value: formatCount(vendorStatusCounts.active),
      description: 'Currently approved & active',
      accent: 'text-emerald-600',
      chip: { text: 'Active', tone: 'bg-emerald-100 text-emerald-600' }
    },
    {
      label: 'Pending Approvals',
      value: formatCount(vendorStatusCounts.pending),
      description: 'Awaiting onboarding completion',
      accent: 'text-amber-600',
      chip: { text: 'Pending', tone: 'bg-amber-100 text-amber-600' }
    },
    {
      label: 'Suspended',
      value: formatCount(vendorStatusCounts.suspended),
      description: 'Temporarily restricted accounts',
      accent: 'text-rose-600',
      chip: { text: 'Review', tone: 'bg-rose-100 text-rose-600' }
    }
  ]

  const overallStats = transactionStats.overall || {}
  const todayStats = transactionStats.today || {}
  const statusKeys = ['SUCCESS', 'PENDING', 'FAILED', 'PROCESSING']

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading dashboard overview…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-rose-700">
        <div className="flex items-start gap-3">
          <svg className="mt-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => loadOverview({ showLoader: true })}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Overview & PayNinja */}
      <section className="grid gap-6 xl:grid-cols-3">
        <article className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Dashboard</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">Admin Control Center</h1>
              <p className="mt-2 text-sm text-slate-500">
                Monitor balances, vendor activity, and payout performance in one place.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {refreshing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refreshing…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Overview
                </>
              )}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lifetime Success Amount</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(transactionStats?.totals?.success_amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across {formatCount(transactionStats?.totals?.success_count)} payouts
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today&apos;s Success Amount</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {formatCurrency(todayStats?.SUCCESS?.amount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{formatCount(todayStats?.SUCCESS?.count)} payouts today</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vendors on Platform</p>
              <p className="mt-2 text-2xl font-semibold text-blue-600">{formatCount(vendorStatusCounts.total)}</p>
              <p className="mt-1 text-xs text-slate-500">{formatCount(vendorStatusCounts.active)} active today</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-6 text-indigo-50 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">PayNinja Wallet</p>
          <p className="mt-3 text-3xl font-semibold">
            {formatCurrency(payninjaBalance?.data?.balance)}
          </p>
          <p className="text-sm text-indigo-200">Currency: {payninjaBalance?.data?.currency || 'INR'}</p>
          {payninjaBalance?.error && (
            <p className="mt-4 rounded-xl bg-black/20 px-4 py-2 text-xs text-rose-100">
              {payninjaBalance.error}
            </p>
          )}
          {payninjaBalance?.data?.raw && (
            <details className="mt-5 rounded-2xl border border-white/20 bg-black/15 p-4 text-xs text-indigo-100 backdrop-blur-sm">
              <summary className="cursor-pointer text-indigo-100/80">View raw response</summary>
              <pre className="mt-3 whitespace-pre-wrap text-[11px] leading-5">
                {JSON.stringify(payninjaBalance.data.raw, null, 2)}
              </pre>
            </details>
          )}
        </article>
      </section>

      {/* Vendor status cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
              {card.chip && (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${card.chip.tone}`}>
                  {card.chip.text}
                </span>
              )}
            </div>
            <p className={`mt-3 text-3xl font-semibold ${card.accent}`}>{card.value}</p>
            <p className="mt-2 text-xs text-slate-500">{card.description}</p>
          </article>
        ))}
      </section>

      {/* Performance & Daily activity */}
      <section className="grid gap-6 xl:grid-cols-3">
        <article className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Performance Breakdown</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Lifetime stats</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statusKeys.map((status) => {
                const entry = overallStats[status] || {}
                return (
                  <div key={status} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
                        {status}
                      </span>
                      <span className="text-xs text-slate-400">Count</span>
                    </div>
                    <p className="mt-3 text-xl font-semibold text-slate-900">{formatCount(entry.count)}</p>
                    <p className="text-xs text-slate-500">Amount: {formatCurrency(entry.amount)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
              <span className="text-xs font-medium text-slate-500">Latest 20 payouts</span>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No recent payouts recorded.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 md:hidden">
                  {recentTransactions.map((txn) => {
                    const status = (txn.status || '').toUpperCase()
                    return (
                      <article key={txn.merchant_reference_id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reference</p>
                            <p className="font-semibold text-slate-900">{txn.merchant_reference_id}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
                            {status || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 text-xs text-slate-500">
                          <p><span className="font-semibold text-slate-700">Amount:</span> {formatCurrency(txn.amount)}</p>
                          <p><span className="font-semibold text-slate-700">Transfer:</span> {txn.transfer_type || '—'}</p>
                          <p><span className="font-semibold text-slate-700">Vendor:</span> {txn.vendor_email || txn.vendor_id || '—'}</p>
                          <p><span className="font-semibold text-slate-700">Created:</span> {formatDate(txn.created_at)}</p>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Transfer Type</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentTransactions.map((txn) => {
                        const status = (txn.status || '').toUpperCase()
                        return (
                          <tr key={txn.merchant_reference_id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{txn.merchant_reference_id}</td>
                            <td className="px-4 py-3 text-slate-600">{txn.vendor_email || txn.vendor_id || '—'}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(txn.amount)}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
                                {status || 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{txn.transfer_type || '—'}</td>
                            <td className="px-4 py-3 text-slate-500">{formatDate(txn.created_at)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Activity</h2>
            <div className="mt-4 space-y-3">
              {statusKeys.map((status) => {
                const entry = todayStats[status] || {}
                return (
                  <div key={status} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
                        {status.slice(0, 2)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{status}</p>
                        <p className="text-xs text-slate-500">{formatCount(entry.count)} payouts</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(entry.amount)}</span>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Top Vendors</h2>
            {topVendors.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No vendor performance data available yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {topVendors.map((vendor) => (
                  <li key={vendor.vendor_id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{vendor.email || vendor.vendor_id}</p>
                      <p className="text-xs text-slate-500">{formatCount(vendor.transaction_count)} transactions</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {formatCurrency(vendor.total_amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      {/* Vendor wallets */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Vendor Wallets</h2>
            <p className="text-xs text-slate-500">Review balances across all vendors in real time.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {formatCount(vendorWallets.length)} wallets
          </span>
        </div>
        {vendorWallets.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No vendor wallets found.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 md:hidden">
              {vendorWallets.map((wallet) => (
                <article key={wallet.vendor_id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{wallet.email || wallet.vendor_id}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{wallet.status}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                      {formatCurrency(wallet.balance)}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500">
                    <p><span className="font-semibold text-slate-700">Currency:</span> {wallet.currency || 'INR'}</p>
                    <p><span className="font-semibold text-slate-700">Updated:</span> {formatDate(wallet.updated_at)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Balance</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Currency</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Updated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorWallets.map((wallet) => (
                    <tr key={wallet.vendor_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{wallet.email || wallet.vendor_id}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{wallet.status || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(wallet.balance)}</td>
                      <td className="px-4 py-3 text-slate-500">{wallet.currency || 'INR'}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(wallet.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
