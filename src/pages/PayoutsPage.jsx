import { useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/auth-api'
import { listBeneficiaries } from '../lib/beneficiary-api'
import { initiateVendorPayout } from '../lib/vendor-payout-api'
import { getWalletBalance } from '../lib/wallet-api'

export default function PayoutsPage() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    beneficiary_id: '',
    amount: '',
    notes: '',
    payout_mode: '', // UPI, IMPS, or NEFT
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const user = getCurrentUser()
      if (!user) {
        console.error('User not authenticated')
        setLoading(false)
        return
      }

      // Fetch active beneficiaries
      const beneficiariesResult = await listBeneficiaries(user.id, { is_active: true })
      if (beneficiariesResult.status === 'success' && beneficiariesResult.data) {
        setBeneficiaries(beneficiariesResult.data.beneficiaries || [])
      }

      // Fetch wallet balance
      const walletResult = await getWalletBalance(user.id)
      if (walletResult.status === 'success' && walletResult.data) {
        setWallet(walletResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendPayout = async (e) => {
    e.preventDefault()

    if (!formData.beneficiary_id) {
      alert('Please select a beneficiary')
      return
    }

    if (!formData.payout_mode) {
      alert('Please select a payout mode')
      return
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const amount = parseFloat(formData.amount)

    // Find selected beneficiary - compare as strings or convert both to same type
    const beneficiaryIdStr = String(formData.beneficiary_id)
    const beneficiary = beneficiaries.find(b => String(b.id) === beneficiaryIdStr)
    
    if (!beneficiary) {
      alert('Beneficiary not found. Please refresh the page and try again.')
      console.error('Beneficiary not found. Selected ID:', formData.beneficiary_id, 'Available IDs:', beneficiaries.map(b => b.id))
      return
    }

    // Validate payout mode compatibility with beneficiary
    if (formData.payout_mode === 'UPI' && !beneficiary.vpa_address) {
      alert('Cannot use UPI mode: This beneficiary does not have a UPI VPA address.')
      return
    }

    if ((formData.payout_mode === 'IMPS' || formData.payout_mode === 'NEFT') && !beneficiary.account_number) {
      alert(`Cannot use ${formData.payout_mode} mode: This beneficiary does not have bank account details.`)
      return
    }

    if (!confirm(`Send ₹${amount} to ${beneficiary.name} via ${formData.payout_mode}?`)) {
      return
    }

    setSending(true)

    try {
      const user = getCurrentUser()
      if (!user) {
        alert('User not authenticated')
        setSending(false)
        return
      }

      // Convert beneficiary_id to integer (backend expects integer)
      const beneficiaryId = parseInt(formData.beneficiary_id, 10)
      if (isNaN(beneficiaryId)) {
        throw new Error('Invalid beneficiary ID')
      }

      console.log('Sending payout with data:', {
        vendor_id: user.id,
        beneficiary_id: beneficiaryId,
        amount: amount,
        transfer_type: formData.payout_mode,
        narration: formData.notes || 'Vendor payout'
      })

      // Initiate payout via vendor payout API (handles wallet deduction, transaction creation, PayNinja API)
      const payoutResponse = await initiateVendorPayout({
        vendor_id: user.id,
        beneficiary_id: beneficiaryId,
        amount: amount,
        transfer_type: formData.payout_mode, // Pass the selected payout mode (UPI, IMPS, or NEFT)
        narration: formData.notes || 'Vendor payout'
      })

      if (payoutResponse.status === 'success' && payoutResponse.data) {
        const transaction = payoutResponse.data.transaction
        const wallet = payoutResponse.data.wallet

        // Update local wallet balance
        if (wallet && wallet.balance_after !== undefined) {
          setWallet(prev => ({
            ...prev,
            balance: wallet.balance_after
          }))
        }

        alert(`Payment initiated successfully! Transaction ID: ${transaction.merchant_reference_id}`)

        // Clear form
        setFormData({
          beneficiary_id: '',
          amount: '',
          notes: '',
          payout_mode: ''
        })

        // Refresh wallet balance
        const walletResult = await getWalletBalance(user.id)
        if (walletResult.status === 'success' && walletResult.data) {
          setWallet(walletResult.data)
        }
      }
    } catch (error) {
      alert(error.message || 'Failed to initiate payout. Please try again.')
      console.error('Error initiating payout:', error)
    } finally {
      setSending(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Send Payout</h1>
            <p className="text-gray-600">Transfer funds to your beneficiaries</p>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">No Beneficiaries Found</h3>
                <p className="text-yellow-700">
                  You need to add at least one active beneficiary before sending payouts. 
                  Please go to the Beneficiaries page to add a new beneficiary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Send Payout
          </h1>
          <p className="text-gray-600 text-lg">Transfer funds securely to your beneficiaries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold opacity-90">Wallet Balance</h2>
                <svg className="w-8 h-8 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-5xl font-bold mb-2">₹{parseFloat(wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="text-blue-200 text-sm">Available Balance</p>
            </div>
          </div>

          {/* Payment Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Send Payment
              </h2>
              
              <form onSubmit={handleSendPayout} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Beneficiary
                  </label>
                  <select
                    required
                    value={formData.beneficiary_id}
                    onChange={(e) => {
                      const selectedBenId = e.target.value
                      const selectedBen = beneficiaries.find(b => String(b.id) === selectedBenId)
                      setFormData({ 
                        ...formData, 
                        beneficiary_id: selectedBenId,
                        payout_mode: selectedBen ? (selectedBen.transfer_type || selectedBen.payment_mode || 'UPI').toUpperCase() : ''
                      })
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  >
                    <option value="">Choose a beneficiary</option>
                    {beneficiaries.map((ben) => (
                      <option key={ben.id} value={ben.id}>
                        {ben.name} ({ben.transfer_type || ben.payment_mode || 'UPI'}) - {ben.vpa_address || ben.account_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payout Mode
                  </label>
                  <select
                    required
                    value={formData.payout_mode}
                    onChange={(e) => {
                      const selectedMode = e.target.value.toUpperCase()
                      // Validate mode compatibility with beneficiary
                      if (formData.beneficiary_id) {
                        const beneficiary = beneficiaries.find(b => String(b.id) === formData.beneficiary_id)
                        if (beneficiary) {
                          // If UPI is selected, beneficiary must have VPA
                          if (selectedMode === 'UPI' && !beneficiary.vpa_address) {
                            alert('This beneficiary does not have a UPI VPA address. Please select IMPS or NEFT.')
                            return
                          }
                          // If IMPS/NEFT is selected, beneficiary must have bank details
                          if ((selectedMode === 'IMPS' || selectedMode === 'NEFT') && !beneficiary.account_number) {
                            alert('This beneficiary does not have bank account details. Please select UPI.')
                            return
                          }
                        }
                      }
                      setFormData({ ...formData, payout_mode: selectedMode })
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                  >
                    <option value="">Select payout mode</option>
                    <option value="UPI">UPI</option>
                    <option value="IMPS">IMPS</option>
                    <option value="NEFT">NEFT</option>
                  </select>
                  {formData.beneficiary_id && formData.payout_mode && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formData.payout_mode === 'UPI' 
                        ? 'Instant transfer via UPI'
                        : formData.payout_mode === 'IMPS'
                        ? 'Instant transfer via IMPS (within minutes)'
                        : 'Transfer via NEFT (may take a few hours)'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="0.00"
                      max={wallet?.balance}
                    />
                  </div>
                  {wallet && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Max available: ₹{parseFloat(wallet.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-gray-900"
                    rows="3"
                    placeholder="Add any notes or description for this transaction"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Payout</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Beneficiaries List */}
        {beneficiaries.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Available Beneficiaries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beneficiaries.map((beneficiary) => (
                <div
                  key={beneficiary.id}
                  className={`p-6 border-2 rounded-xl transition-all duration-200 ${
                    formData.beneficiary_id === beneficiary.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{beneficiary.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      beneficiary.transfer_type === 'UPI' 
                        ? 'bg-purple-100 text-purple-700'
                        : beneficiary.transfer_type === 'IMPS'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {beneficiary.transfer_type || 'UPI'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {beneficiary.vpa_address && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        VPA: <span className="font-semibold ml-1">{beneficiary.vpa_address}</span>
                      </p>
                    )}
                    {beneficiary.account_number && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Account: <span className="font-semibold ml-1">{beneficiary.account_number}</span>
                      </p>
                    )}
                    {beneficiary.bank_name && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Bank: <span className="font-semibold ml-1">{beneficiary.bank_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
