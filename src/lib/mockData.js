/**
 * Mock Data for React-only version
 * Replace with actual API calls when backend is ready
 */

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'vendor@example.com',
  role: 'vendor'
}

// Mock wallet data
export const mockWallet = {
  id: 'wallet-123',
  vendor_id: 'user-123',
  balance: '5000.00',
  created_at: new Date().toISOString()
}

// Mock beneficiaries
export const mockBeneficiaries = [
  {
    id: 'ben-1',
    vendor_id: 'user-123',
    name: 'John Doe',
    phone_number: '9876543210',
    payment_mode: 'UPI',
    vpa_address: 'john@upi',
    status: 'active'
  },
  {
    id: 'ben-2',
    vendor_id: 'user-123',
    name: 'Jane Smith',
    phone_number: '9876543211',
    payment_mode: 'IMPS',
    account_number: '1234567890',
    ifsc_code: 'SBIN0001234',
    bank_name: 'State Bank of India',
    status: 'active'
  }
]

// Mock transactions
export const mockTransactions = [
  {
    id: 'txn-1',
    vendor_id: 'user-123',
    type: 'payout',
    amount: '1000.00',
    status: 'success',
    reference_number: 'REF-123',
    created_at: new Date().toISOString()
  }
]

// Mock auth functions
export const mockAuth = {
  getUser: async () => ({
    data: { user: mockUser },
    error: null
  }),
  signInWithPassword: async ({ email, password }) => {
    return {
      data: { user: mockUser },
      error: null
    }
  },
  signUp: async ({ email, password }) => {
    return {
      data: { user: mockUser },
      error: null
    }
  },
  signOut: async () => {
    return { error: null }
  },
  onAuthStateChange: (callback) => {
    callback('SIGNED_IN', { user: mockUser })
    return {
      data: { subscription: { unsubscribe: () => {} } }
    }
  }
}

// Mock database functions
export const mockDatabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        single: async () => {
          if (table === 'wallets' && column === 'vendor_id') {
            return { data: mockWallet, error: null }
          }
          if (table === 'profiles' && column === 'id') {
            return { data: { role: 'vendor' }, error: null }
          }
          return { data: null, error: { code: 'PGRST116' } }
        },
        async then(resolve) {
          if (table === 'beneficiaries' && column === 'vendor_id') {
            resolve({ data: mockBeneficiaries, error: null })
          } else if (table === 'transactions' && column === 'vendor_id') {
            resolve({ data: mockTransactions, error: null })
          } else if (table === 'wallets' && column === 'vendor_id') {
            resolve({ data: [mockWallet], error: null })
          } else if (table === 'profiles' && column === 'role') {
            resolve({ count: 5, error: null })
          } else {
            resolve({ data: [], error: null })
          }
        }
      }),
      async then(resolve) {
        resolve({ data: [], error: null })
      }
    }),
    insert: async (data) => ({ data: { id: 'new-id' }, error: null }),
    update: (data) => ({
      eq: async () => ({ data: null, error: null })
    })
  })
}

