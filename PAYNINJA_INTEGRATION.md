# PayNinja Payment Integration

This document describes the PayNinja payment gateway integration for the Vendor Payout System.

## Overview

The system integrates with PayNinja's payout API to enable real-time fund transfers to beneficiaries via UPI, IMPS, and NEFT.

## Features

- **Multiple Payment Modes**: Support for UPI, IMPS, and NEFT
- **Secure Encryption**: AES-256-CBC encryption for all payment requests
- **Digital Signatures**: SHA-256 signatures for authentication
- **Status Tracking**: Real-time transaction status polling
- **Webhook Support**: Handle payment status updates from PayNinja

## Database Schema Changes

### Beneficiaries Table

New fields added:
- `phone_number` (TEXT, NOT NULL) - Beneficiary phone number
- `vpa_address` (TEXT) - UPI VPA address (required for UPI mode)
- `payment_mode` (TEXT) - Payment mode: UPI, IMPS, or NEFT

Constraints:
- UPI mode: Requires `vpa_address`
- IMPS/NEFT mode: Requires `account_number`, `ifsc_code`, and `bank_name`

### Transactions Table

New fields added:
- `merchant_reference_id` (TEXT) - Unique merchant reference ID for PayNinja
- `utr` (TEXT) - UTR (Unique Transaction Reference) from payment gateway
- `status` - Extended to include: processing, success, reversed

## Setup Instructions

### 1. Database Migration

If you have an existing database, run the migration script:

```bash
# In Supabase SQL Editor
Run: supabase/05_payment_migration.sql
```

For new setups, the updated `01_tables.sql` already includes the new fields.

### 2. Configuration

API credentials are configured in `src/lib/payment-api.js`:

```javascript
const API_BASE_URL = 'https://api.payninja.com'
const API_KEY = 'OIUtbCBrH3YNvyTB3gDt5W1lF0xOtNtT'
const SECRET_KEY = 'O8LXxrFD6ryvUWBkwA8Bb6sOTNX1akq81iNmjDV17uU3f54AYiM6iOvZIbobhnrw'
const ENCRYPTION_KEY = '0DA4094555C92AD7EA2D0FDEA012BEC7'
const API_CODE = '810'
```

**Important**: Move these credentials to environment variables or a secure server-side configuration for production.

### 3. Dependencies

The integration requires `crypto-js` for encryption:

```bash
npm install crypto-js
```

This should already be installed if you followed the setup.

## Usage

### Adding a Beneficiary

1. Navigate to **Vendors → Beneficiaries**
2. Click **Add Beneficiary**
3. Fill in details based on payment mode:
   - **UPI**: Name, Phone, VPA Address
   - **IMPS/NEFT**: Name, Phone, Account Number, IFSC, Bank Name
4. Select payment mode and save

### Initiating a Payout

1. Navigate to **Vendors → Payouts**
2. Select beneficiary, enter amount and notes
3. Click **Send Payout**
4. System will:
   - Create transaction record with "processing" status
   - Initiate payment via PayNinja API
   - Poll for status updates
   - Update transaction and wallet balance on success

## API Functions

### `initiateFundTransfer(transferData)`

Initiates a fund transfer via PayNinja.

**Parameters:**
- `beneficiary`: Beneficiary details (name, phoneNumber, vpaAddress/accountNumber, ifsc, bankName)
- `amount`: Transfer amount
- `mode`: Payment mode (UPI, IMPS, NEFT)
- `merchantReferenceId`: Unique reference ID
- `narration`: Optional transaction narration

**Returns:** Promise resolving to PayNinja response

### `checkTransactionStatus(merchantReferenceId)`

Checks current status of a transaction.

**Parameters:**
- `merchantReferenceId`: Merchant reference ID

**Returns:** Promise resolving to transaction status

### `pollTransactionStatus(merchantReferenceId, maxAttempts, interval)`

Polls transaction status until completion.

**Parameters:**
- `merchantReferenceId`: Merchant reference ID
- `maxAttempts`: Maximum polling attempts (default: 60)
- `interval`: Polling interval in ms (default: 5000)

**Returns:** Promise resolving to final transaction status

### `generateMerchantReferenceId(vendorId)`

Generates unique merchant reference ID.

**Format:** `VND{first8charsOfVendorId}{timestamp}{random6chars}`

**Example:** `VND12345678901234567890ABC`

## Transaction Flow

1. **User Initiates Payout**
   - System validates beneficiary and amount
   - Checks wallet balance

2. **Create Transaction Record**
   - Insert transaction with "processing" status
   - Generate merchant reference ID

3. **API Call**
   - Generate SHA-256 signature
   - Encrypt payload with AES-256-CBC
   - Send to PayNinja fundTransfer endpoint

4. **Status Polling**
   - Poll transaction status endpoint
   - Update transaction record with UTR and status

5. **Wallet Update**
   - Database trigger updates wallet balance on "success"
   - User notified of completion

## Payment Modes

### UPI

**Required Fields:**
- Name
- Phone Number
- VPA Address (e.g., `user@upi`)

**Signature Format:**
```
{name}-{phoneNumber}-{vpaAddress}-{amount}-{merchantRefId}-UPI-810-{narration}{secretKey}
```

### IMPS / NEFT

**Required Fields:**
- Name
- Phone Number
- Account Number
- IFSC Code
- Bank Name

**Signature Format:**
```
{name}-{phoneNumber}-{accountNumber}-{ifsc}-{bankName}-{amount}-{merchantRefId}-{mode}-810-{narration}{secretKey}
```

## Security

### Encryption

All fund transfer requests are encrypted using:
- **Algorithm**: AES-256-CBC
- **Key**: 32-character hex key
- **IV**: Randomly generated per request

### Signatures

SHA-256 signatures are generated for authentication and verification.

### Environment Variables

**Production Recommendations:**

1. Move API credentials to server-side environment variables
2. Never expose secrets in client-side code
3. Use a proxy server for API calls in production
4. Implement proper CORS policies

## Error Handling

### Common Errors

- **Insufficient Balance**: Check wallet balance before initiating
- **Invalid Beneficiary**: Verify beneficiary fields match payment mode
- **API Timeout**: Retry logic handles transient failures
- **Payment Failure**: Transaction marked as "failed", wallet not updated

### Transaction States

- `pending` - Transaction created, not yet submitted
- `processing` - Submitted to PayNinja, awaiting confirmation
- `success` - Payment completed successfully
- `failed` - Payment failed
- `reversed` - Payment reversed

## Testing

### API Environment

Current configuration uses PayNinja production API:
- URL: `https://api.payninja.com`

### Test Beneficiaries

Use PayNinja test accounts for UPI:
- VPA: `success@vpa`, `failure@vpa`

For IMPS/NEFT, use test bank details provided by PayNinja.

## Troubleshooting

### Payment Not Processing

1. Check beneficiary fields are complete
2. Verify API credentials
3. Check browser console for errors
4. Verify network connectivity

### Status Not Updating

1. Check polling is running (should complete within 60 attempts)
2. Verify merchant reference ID is correct
3. Check PayNinja dashboard for transaction status

### Wallet Balance Issues

1. Verify trigger is installed: `update_wallet_balance()`
2. Check transaction status is "success"
3. Verify trigger fires on status updates

## Production Checklist

- [ ] Move API credentials to environment variables
- [ ] Configure production API endpoint
- [ ] Set up webhook endpoint for status updates
- [ ] Implement proper logging
- [ ] Add monitoring and alerts
- [ ] Configure rate limiting
- [ ] Test with production credentials
- [ ] Verify webhook security
- [ ] Set up transaction reconciliation
- [ ] Configure backup and recovery

## Support

For PayNinja API issues:
- Check [PayNinja Documentation](https://payninja.in/docs)
- Contact PayNinja support

For system issues:
- Check database triggers and functions
- Verify RLS policies
- Review browser console logs
- Check Supabase logs

## Related Files

- `src/lib/payment-api.js` - Payment API functions
- `src/pages/PayoutsPage.jsx` - Payout UI
- `src/pages/BeneficiariesPage.jsx` - Beneficiary management
- `supabase/05_payment_migration.sql` - Database migration
- `supabase/01_tables.sql` - Updated schema

