# PHP Backend CORS Fix

This file contains the CORS headers you need to add to your PHP backend to fix CORS errors.

## Solution 1: Add CORS Headers to Each PHP File

Add these headers at the **very beginning** of each PHP file (before any output):

```php
<?php
header('Access-Control-Allow-Origin: *'); // In production, replace * with your React app URL
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // 24 hours
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your PHP code here...
?>
```

## Solution 2: Create a CORS Helper File (Recommended)

### Step 1: Create `backend/api/cors.php`

```php
<?php
/**
 * CORS Headers Helper
 * Include this file at the top of all your API endpoints
 */

function setCorsHeaders() {
    // Get the origin from the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
    
    // List of allowed origins (add your React app URLs here)
    $allowedOrigins = [
        'http://localhost:5173',  // Vite dev server default
        'http://localhost:3000',  // Alternative port
        'http://localhost:5174',  // Alternative port
        'http://127.0.0.1:5173',  // Alternative localhost
        // Add production URL here: 'https://your-domain.com'
    ];
    
    // Check if origin is allowed, or use * for development
    $allowedOrigin = in_array($origin, $allowedOrigins) ? $origin : '*';
    
    // Set CORS headers
    header("Access-Control-Allow-Origin: {$allowedOrigin}");
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, api-Key');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // 24 hours
    header('Content-Type: application/json; charset=utf-8');
}

// Set CORS headers
setCorsHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

### Step 2: Include in Your PHP Files

**Example: `backend/api/auth/login.php`**

```php
<?php
// Include CORS headers
require_once __DIR__ . '/cors.php';

// Now your login logic
$data = json_decode(file_get_contents('php://input'), true);

// Your code here...
?>
```

**Example: `backend/api/auth/signup.php`**

```php
<?php
// Include CORS headers
require_once __DIR__ . '/cors.php';

// Now your signup logic
$data = json_decode(file_get_contents('php://input'), true);

// Your code here...
?>
```

**Example: `backend/api/payout/initiate.php`**

```php
<?php
// Include CORS headers
require_once __DIR__ . '/../cors.php';

// Now your payout logic
$data = json_decode(file_get_contents('php://input'), true);

// Your code here...
?>
```

## Solution 3: Using .htaccess (Apache Server)

If you're using Apache, create `backend/.htaccess`:

```apache
<IfModule mod_headers.c>
    # Allow from all origins (for development)
    Header set Access-Control-Allow-Origin "*"
    
    # Or allow specific origin (for production)
    # Header set Access-Control-Allow-Origin "http://localhost:5173"
    
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, api-Key"
    Header set Access-Control-Max-Age "86400"
</IfModule>

# Handle OPTIONS preflight requests
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

## Solution 4: Complete Example for login.php

Here's a complete `login.php` with CORS headers:

```php
<?php
// CORS Headers
header('Access-Control-Allow-Origin: *'); // Change * to your React app URL in production
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST for login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
    exit();
}

// Your login logic here...
// Example:
// - Validate credentials
// - Check account status
// - Generate token
// - Return user data

// Success response
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Login successful',
    'data' => [
        'user' => [
            'id' => 'user-id',
            'email' => $data['email'],
            'role' => 'vendor',
            'status' => 'active'
        ],
        'token' => 'your-jwt-token'
    ]
]);
?>
```

## Important Notes

1. **Order Matters**: CORS headers must be set BEFORE any output (including echo, print, whitespace, etc.)

2. **OPTIONS Request**: Browsers send an OPTIONS request first (preflight). Your server must respond with 200 OK.

3. **Production**: In production, replace `*` with your actual React app domain:
   ```php
   header('Access-Control-Allow-Origin: https://yourdomain.com');
   ```

4. **Credentials**: If using cookies/tokens, you may need:
   ```php
   header('Access-Control-Allow-Credentials: true');
   ```
   And change `*` to a specific origin.

5. **Common Error**: "No 'Access-Control-Allow-Origin' header" means headers aren't being set. Make sure they're at the very top of your PHP file, before any output.

## Quick Test

Test your CORS setup:

```bash
curl -X OPTIONS http://localhost/backend/api/auth/login.php \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

You should see the CORS headers in the response.

