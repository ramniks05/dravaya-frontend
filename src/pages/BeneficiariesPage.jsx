import { useState, useEffect } from 'react'
import { getCurrentUser } from '../lib/auth-api'
import { createBeneficiary, listBeneficiaries, updateBeneficiary, deleteBeneficiary } from '../lib/beneficiary-api'

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    transfer_type: 'UPI',
    vpa_address: '',
    account_number: '',
    bank_name: '',
    ifsc: '',
  })
  const [transferTypeFilter, setTransferTypeFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      fetchBeneficiaries(user.id)
    }
  }, [transferTypeFilter, activeFilter])

  const fetchBeneficiaries = async (vendorId) => {
    setLoading(true)
    setError('')
    try {
      const options = {}
      
      if (transferTypeFilter !== 'all') {
        options.transfer_type = transferTypeFilter
      }
      
      if (activeFilter !== 'all') {
        options.is_active = activeFilter === 'active'
      }

      const result = await listBeneficiaries(vendorId, options)

      if (result.status === 'success' && result.data) {
        setBeneficiaries(result.data.beneficiaries || [])
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch beneficiaries')
      console.error('Error fetching beneficiaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const user = getCurrentUser()
    if (!user) {
      setError('User not authenticated')
      setSubmitting(false)
      return
    }

    try {
      // Prepare payload based on transfer type
      const payload = {
        vendor_id: user.id,
        name: formData.name,
        phone_number: formData.phone_number,
        transfer_type: formData.transfer_type,
        is_active: true
      }

      if (formData.transfer_type === 'UPI') {
        if (!formData.vpa_address) {
          setError('VPA address is required for UPI transfers')
          setSubmitting(false)
          return
        }
        payload.vpa_address = formData.vpa_address
      } else {
        // IMPS or NEFT
        if (!formData.account_number || !formData.ifsc || !formData.bank_name) {
          setError('Account number, IFSC, and bank name are required for IMPS/NEFT transfers')
          setSubmitting(false)
          return
        }
        payload.account_number = formData.account_number
        payload.ifsc = formData.ifsc
        payload.bank_name = formData.bank_name
      }

      if (editingId) {
        // Update existing
        payload.id = editingId
        const result = await updateBeneficiary(payload)
        
        if (result.status === 'success') {
          setSuccess(result.message || 'Beneficiary updated successfully')
          resetForm()
          fetchBeneficiaries(user.id)
        }
      } else {
        // Create new
        const result = await createBeneficiary(payload)
        
        if (result.status === 'success') {
          setSuccess(result.message || 'Beneficiary added successfully')
          resetForm()
          fetchBeneficiaries(user.id)
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to save beneficiary')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (beneficiary) => {
    setEditingId(beneficiary.id)
    setFormData({
      name: beneficiary.name || '',
      phone_number: beneficiary.phone_number || '',
      transfer_type: beneficiary.transfer_type || 'UPI',
      vpa_address: beneficiary.vpa_address || '',
      account_number: beneficiary.account_number || '',
      bank_name: beneficiary.bank_name || '',
      ifsc: beneficiary.ifsc || '',
    })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  const handleStatusChange = async (id) => {
    const user = getCurrentUser()
    if (!user) {
      alert('User not authenticated')
      return
    }

    const beneficiary = beneficiaries.find(b => b.id === id)
    if (!beneficiary) return

    const newStatus = beneficiary.is_active ? false : true

    try {
      const payload = {
        id: id,
        vendor_id: user.id,
        is_active: newStatus
      }

      const result = await updateBeneficiary(payload)
      
      if (result.status === 'success') {
        alert('Status updated successfully')
        fetchBeneficiaries(user.id)
      }
    } catch (error) {
      alert(error.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this beneficiary?')) {
      return
    }

    const user = getCurrentUser()
    if (!user) {
      alert('User not authenticated')
      return
    }

    try {
      const result = await deleteBeneficiary(id, user.id)
      
      if (result.status === 'success') {
        alert(result.message || 'Beneficiary deleted successfully')
        fetchBeneficiaries(user.id)
      }
    } catch (error) {
      alert(error.message || 'Failed to delete beneficiary')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      phone_number: '',
      transfer_type: 'UPI',
      vpa_address: '',
      account_number: '',
      bank_name: '',
      ifsc: '',
    })
    setError('')
    setSuccess('')
  }

  const getStatusBadgeClass = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }

  const user = getCurrentUser()

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
        <button
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setShowForm(true)
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showForm ? 'Cancel' : 'Add Beneficiary'}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Beneficiary' : 'Add New Beneficiary'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                maxLength="10"
                pattern="[0-9]{10}"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">10-digit Indian mobile number</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Type</label>
              <select
                required
                value={formData.transfer_type}
                onChange={(e) => setFormData({ ...formData, transfer_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UPI">UPI</option>
                <option value="IMPS">IMPS</option>
                <option value="NEFT">NEFT</option>
              </select>
            </div>
            {formData.transfer_type === 'UPI' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VPA Address</label>
                <input
                  type="text"
                  required
                  value={formData.vpa_address}
                  onChange={(e) => setFormData({ ...formData, vpa_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@upi"
                />
              </div>
            )}
            {(formData.transfer_type === 'IMPS' || formData.transfer_type === 'NEFT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    maxLength="11"
                    value={formData.ifsc}
                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="HDFC0001234"
                  />
                </div>
              </>
            )}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Beneficiary
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Transfer Type</label>
          <select
            value={transferTypeFilter}
            onChange={(e) => setTransferTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Beneficiaries List */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading beneficiaries...</div>
        </div>
      ) : beneficiaries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">No beneficiaries found</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {beneficiaries.map((beneficiary) => (
              <li key={beneficiary.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{beneficiary.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(beneficiary.is_active)}`}>
                        {beneficiary.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {beneficiary.transfer_type}
                      </span>
                    </div>
                    {beneficiary.phone_number && (
                      <p className="text-sm text-gray-600">Phone: {beneficiary.phone_number}</p>
                    )}
                    {beneficiary.vpa_address && (
                      <p className="text-sm text-gray-600">VPA: {beneficiary.vpa_address}</p>
                    )}
                    {beneficiary.account_number && (
                      <p className="text-sm text-gray-600">Account: {beneficiary.account_number}</p>
                    )}
                    {beneficiary.bank_name && (
                      <p className="text-sm text-gray-600">Bank: {beneficiary.bank_name}</p>
                    )}
                    {beneficiary.ifsc && (
                      <p className="text-sm text-gray-600">IFSC: {beneficiary.ifsc}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(beneficiary.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(beneficiary)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusChange(beneficiary.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 ${
                        beneficiary.is_active
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                          : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      }`}
                    >
                      {beneficiary.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(beneficiary.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
