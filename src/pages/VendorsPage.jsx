import { useState, useEffect } from 'react'
import { getAllVendors, updateVendorStatus, getVendorStats } from '../lib/vendor-api'

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVendors()
    fetchStats()
  }, [statusFilter])

  const fetchVendors = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getAllVendors({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: 'vendor',
        limit: 100
      })

      if (result.status === 'success' && result.data) {
        setVendors(result.data.vendors || [])
        setPagination(result.data.pagination || null)
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch vendors')
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await getVendorStats()
      if (result.status === 'success' && result.data) {
        setStats(result.data.statistics || result.data.summary)
      }
    } catch (error) {
      console.error('Error fetching vendor stats:', error)
    }
  }

  const handleStatusChange = async (vendorId, action) => {
    try {
      const result = await updateVendorStatus(vendorId, action)
      
      if (result.status === 'success') {
        // Update local state
        setVendors(prevVendors =>
          prevVendors.map(vendor =>
            vendor.id === vendorId
              ? { ...vendor, status: result.data.vendor.status }
              : vendor
          )
        )
        
        // Refresh stats
        fetchStats()
        
        // Show success message
        alert(result.message || 'Vendor status updated successfully')
      }
    } catch (error) {
      alert(error.message || 'Failed to update vendor status')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Vendors</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Active Vendors</div>
            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Suspended</div>
            <div className="text-2xl font-bold text-red-600">{stats.suspended || 0}</div>
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
          <option value="all">All Vendors</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Vendors List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading vendors...</div>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">No vendors found</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <li key={vendor.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{vendor.email}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {vendor.id}</span>
                      <span>•</span>
                      <span>Role: {vendor.role}</span>
                      <span>•</span>
                      <span>Created: {new Date(vendor.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {vendor.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(vendor.id, 'approve')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                    )}
                    {vendor.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(vendor.id, 'suspend')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Suspend
                      </button>
                    )}
                    {vendor.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusChange(vendor.id, 'activate')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Activate
                      </button>
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
                ({pagination.total} total vendors)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
