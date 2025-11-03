import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vendors, setVendors] = useState({})
  const [beneficiaries, setBeneficiaries] = useState({})

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    if (userRole) {
      fetchTransactions()
    }
  }, [userRole, typeFilter, statusFilter])

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile) {
      setUserRole(profile.role)
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false })

      if (userRole === 'vendor') {
        const { data: { user } } = await supabase.auth.getUser()
        query = query.eq('vendor_id', user.id)
      }

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error

      setTransactions(data || [])

      // Fetch vendor details (for admin view)
      if (userRole === 'admin') {
        const vendorIds = [...new Set((data || []).map(t => t.vendor_id))]
        const { data: vendorData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', vendorIds)

        const vendorMap = {}
        vendorData?.forEach(v => {
          vendorMap[v.id] = v.email
        })
        setVendors(vendorMap)
      }

      // Fetch beneficiary details
      const beneficiaryIds = [...new Set((data || []).map(t => t.beneficiary_id).filter(Boolean))]
      if (beneficiaryIds.length > 0) {
        const { data: beneficiaryData } = await supabase
          .from('beneficiaries')
          .select('id, name')
          .in('id', beneficiaryIds)

        const beneficiaryMap = {}
        beneficiaryData?.forEach(b => {
          beneficiaryMap[b.id] = b.name
        })
        setBeneficiaries(beneficiaryMap)
      }
    } catch (error) {
      alert('Error fetching transactions: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All</option>
            <option value="top_up">Top-up</option>
            <option value="payout">Payout</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading transactions...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {userRole === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                        {vendors[transaction.vendor_id] || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.reference_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'top_up'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.beneficiary_id ? beneficiaries[transaction.beneficiary_id] || 'N/A' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed' || transaction.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-gray-100 text-gray-800'
                            : transaction.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.status === 'reversed'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.utr || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleString()}
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

