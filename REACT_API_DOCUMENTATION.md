# React Frontend API Documentation

This document describes all API endpoints that the React frontend expects from the PHP backend.

## Base URLs

- **Development**: `http://localhost/backend/api`
- **Production**: Update `src/lib/config.js` or set `VITE_API_BASE_URL` environment variable

---

## Authentication APIs

### 1. Signup

**Endpoint**: `POST /backend/api/auth/signup.php`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "message": "Account created successfully! Your account is pending approval. Please wait for an admin to activate your account.",
  "data": {
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "created_at": "2025-01-15T10:30:00Z"
    }
  }
}
```

**Error Response (400)**:
```json
{
  "status": "error",
  "message": "Email already exists"
}
```

---

### 2. Login

**Endpoint**: `POST /backend/api/auth/login.php`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "role": "vendor",
      "status": "active"
    },
    "token": "jwt-token-here"
  }
}
```

**Important**: Response MUST include `role` and `status` fields.

- **role**: `"admin"` or `"vendor"`
- **status**: `"active"`, `"pending"`, or `"suspended"`

**Error Responses**:
- **401**: Invalid credentials
- **403**: Account pending or suspended

---

## Payment APIs

### 3. Initiate Fund Transfer

**Endpoint**: `POST /backend/api/payout/initiate.php`

**Request**:
```json
{
  "ben_name": "John Doe",
  "ben_phone_number": "9876543210",
  "amount": "100",
  "merchant_reference_id": "VND12345678901234567890ABC",
  "transfer_type": "IMPS",
  "narration": "PAYNINJA Fund Transfer",
  "ben_account_number": "1234567890",
  "ben_ifsc": "SBIN0001234",
  "ben_bank_name": "state bank of india"
}
```

**For UPI**:
```json
{
  "ben_name": "John Doe",
  "ben_phone_number": "9876543210",
  "amount": "100",
  "merchant_reference_id": "VND12345678901234567890ABC",
  "transfer_type": "UPI",
  "narration": "PAYNINJA Fund Transfer",
  "ben_vpa_address": "user@upi"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "message": "Fund transfer initiated successfully",
  "data": {
    "merchant_reference_id": "VND12345678901234567890ABC",
    "status": "processing"
  }
}
```

---

### 4. Check Transaction Status

**Endpoint**: `POST /backend/api/payout/status.php`

**Request**:
```json
{
  "merchant_reference_id": "VND12345678901234567890ABC"
}
```

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "status": "success",
    "utr": "UTR123456789012"
  }
}
```

**Status values**: `"pending"`, `"processing"`, `"success"`, `"failed"`

---

### 5. Get Account Balance

**Endpoint**: `GET /backend/api/payout/balance.php`

**Request**: No body required

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "balance": "10000.00"
  }
}
```

---

## Configuration

Update `src/lib/config.js` to change API URLs:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/backend/api'
```

Or set environment variable:
```bash
VITE_API_BASE_URL=https://your-domain.com/backend/api
```

---

## Notes

1. All API calls use JSON format
2. All endpoints should return JSON responses
3. Use proper HTTP status codes
4. **IMPORTANT**: Include CORS headers for cross-origin requests (see `PHP_CORS_FIX.md`)
5. Error messages should be in `message` field
6. Success data should be in `data` field

## CORS Configuration

**Critical**: All PHP endpoints must include CORS headers. See `PHP_CORS_FIX.md` for complete implementation.

Quick fix - Add to top of each PHP file:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

