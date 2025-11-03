# Vendor Payout Management - Implementation Summary

## Overview
The vendor payout management system has been fully implemented in the React frontend to work with the PHP backend API. The backend handles wallet deduction, transaction creation, and PayNinja API integration automatically.

## Files Created/Modified

### 1. **New File: `src/lib/vendor-payout-api.js`**
   - API client for vendor payout operations
   - Functions:
     - `generatePayoutReferenceId()` - Generate unique payout reference ID
     - `initiateVendorPayout(payoutData)` - Initiate payout with beneficiary or manual entry

### 2. **Modified: `src/pages/PayoutsPage.jsx`**
   - Completely refactored to use vendor payout API instead of direct PayNinja API calls
   - Simplified flow - backend handles:
     - Wallet balance checking
     - Automatic wallet deduction
     - Transaction creation
     - PayNinja API integration
   - Features:
     - Real-time wallet balance update after payout
     - Error handling with clear messages
     - Form reset after successful payout

## API Endpoints Used

### Vendor Payout Endpoint
**Base URL**: `http://localhost/backend/api/vendor/payout/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/initiate.php` | Initiate payout (with beneficiary or manual entry) |

## Features Implemented

### ✅ Simplified Payout Flow
- **Before**: Frontend had to:
  1. Check wallet balance
  2. Create transaction record in Supabase
  3. Call PayNinja API
  4. Poll for status
  5. Update transaction status
  6. Update wallet balance

- **After**: Frontend only needs to:
  1. Call `initiateVendorPayout()` API
  2. Backend handles everything automatically

### ✅ Wallet Management
- Automatic balance checking before payout
- Automatic deduction after successful PayNinja API call
- Real-time wallet balance update in UI
- Balance refresh after payout

### ✅ Transaction Handling
- Backend creates transaction record automatically
- Links transaction to vendor and beneficiary
- Saves merchant reference ID
- Tracks transaction status

### ✅ Error Handling
- Insufficient balance errors with available balance shown
- Beneficiary validation errors
- PayNinja API errors (wallet not deducted if API fails)
- Clear error messages for user

## Usage Examples

### Initiate Payout Using Saved Beneficiary
```javascript
import { initiateVendorPayout } from '../lib/vendor-payout-api'

await initiateVendorPayout({
  vendor_id: 'vendor-uuid',
  beneficiary_id: 1,
  amount: 1000.00,
  narration: 'Monthly payment'
})
```

### Initiate Payout with Manual Entry (UPI)
```javascript
await initiateVendorPayout({
  vendor_id: 'vendor-uuid',
  amount: 1000.00,
  transfer_type: 'UPI',
  ben_name: 'John Doe',
  ben_phone_number: '9876543210',
  ben_vpa_address: 'john@upi',
  narration: 'Payment for services'
})
```

### Initiate Payout with Manual Entry (IMPS/NEFT)
```javascript
await initiateVendorPayout({
  vendor_id: 'vendor-uuid',
  amount: 1000.00,
  transfer_type: 'IMPS',
  ben_name: 'John Doe',
  ben_phone_number: '9876543210',
  ben_account_number: '1234567890',
  ben_ifsc: 'HDFC0001234',
  ben_bank_name: 'HDFC Bank',
  narration: 'Payment for services'
})
```

## Response Format

Success response:
```javascript
{
  status: 'success',
  message: 'Payout initiated successfully',
  data: {
    transaction: {
      merchant_reference_id: 'PAYOUT_1704110400_abc12345',
      payninja_transaction_id: 'TXN123456',
      amount: 1000.00,
      transfer_type: 'UPI',
      status: 'PENDING'
    },
    wallet: {
      balance_before: 10000.00,
      balance_after: 9000.00,
      deducted: true
    },
    beneficiary_used: true,
    payninja_response: {
      status: 'success',
      data: {
        transaction_id: 'TXN123456',
        message: 'Transaction initiated'
      }
    }
  }
}
```

## Important Notes

### Backend Responsibilities
The PHP backend now handles:
1. ✅ Wallet balance validation
2. ✅ Beneficiary validation (if using beneficiary_id)
3. ✅ Transaction record creation
4. ✅ PayNinja API integration
5. ✅ Wallet deduction (only after successful PayNinja API call)
6. ✅ Error handling and rollback

### Frontend Responsibilities
The React frontend now only needs to:
1. ✅ Call `initiateVendorPayout()` API
2. ✅ Update UI with response data
3. ✅ Handle errors and show messages
4. ✅ Refresh wallet balance after payout

### Security Features
- ✅ Wallet balance checked before payout
- ✅ Beneficiary must belong to vendor
- ✅ Beneficiary must be active
- ✅ Vendor must be active
- ✅ Wallet only deducted after successful PayNinja API call
- ✅ Transaction saved with FAILED status if PayNinja API fails (for audit)

## Workflow

### Using Saved Beneficiary
1. Vendor selects beneficiary from dropdown
2. Vendor enters amount and notes
3. Frontend calls `initiateVendorPayout({ beneficiary_id, amount, ... })`
4. Backend:
   - Validates beneficiary
   - Checks wallet balance
   - Creates transaction record
   - Calls PayNinja API
   - Deducts from wallet (if successful)
   - Returns response with transaction and wallet info
5. Frontend:
   - Updates wallet balance in UI
   - Shows success message
   - Clears form

### Manual Entry
1. Vendor enters beneficiary details manually
2. Frontend calls `initiateVendorPayout({ transfer_type, ben_name, ... })`
3. Backend:
   - Validates input
   - Checks wallet balance
   - Creates transaction record
   - Calls PayNinja API
   - Deducts from wallet (if successful)
4. Frontend updates UI

## Error Handling

All errors are thrown and can be caught:

```javascript
try {
  await initiateVendorPayout(payoutData)
} catch (error) {
  // Handle error
  // Error message includes:
  // - "Insufficient wallet balance. Available: X.XX"
  // - "Beneficiary not found or inactive"
  // - "Vendor account is not active"
  // - "Fund transfer request failed" (PayNinja API error)
  alert(error.message)
}
```

## Configuration

API base URL is configured in `src/lib/config.js`:

```javascript
export const VENDOR_API_URL = `${API_BASE}/vendor`
```

To change the base URL, update `VITE_API_BASE_URL` environment variable or modify `config.js`.

## Testing

To test the implementation:

1. Ensure your PHP backend is running at `http://localhost/backend/api/`
2. Start the React dev server: `npm run dev`
3. Login as vendor
4. Navigate to `/vendor/payouts`
5. Test the following:
   - Select beneficiary and initiate payout
   - Verify wallet balance decreases after successful payout
   - Test with insufficient balance (should show error)
   - Test with inactive beneficiary (should show error)
   - Verify transaction is created in database

## Benefits of New Implementation

1. **Simplified Frontend Code**: Reduced from ~150 lines to ~80 lines
2. **Better Security**: Wallet validation and deduction handled server-side
3. **Data Consistency**: Backend ensures transaction and wallet are updated atomically
4. **Error Recovery**: Backend handles rollback if PayNinja API fails
5. **Audit Trail**: All transactions properly linked to vendor and beneficiary
6. **Better Error Messages**: Backend provides detailed error messages

## CORS Configuration

Make sure your PHP backend includes CORS headers. See `PHP_CORS_FIX.md` for details.

All endpoints should include:
- `Access-Control-Allow-Origin: *` (or specific origin)
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- Handle OPTIONS preflight requests

## Database Requirements

The backend should have updated transactions table:

```sql
ALTER TABLE transactions 
ADD COLUMN vendor_id VARCHAR(36) DEFAULT NULL,
ADD COLUMN beneficiary_id INT DEFAULT NULL;
```

See the API documentation for complete schema requirements.

