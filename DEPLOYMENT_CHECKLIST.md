# Vercel Deployment Checklist

## ✅ Pre-Deployment Setup

- [x] Config updated to auto-detect production environment
- [x] Config uses live API (`http://dravya.hrntechsolutions.com/api`) in production
- [x] Environment variable support added (`VITE_API_BASE_URL`)
- [x] `.gitignore` includes `.env` files
- [x] `.env.example` created for reference

## 📋 Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Configure for Vercel deployment with live backend API"
git push origin main
```

### 2. Deploy to Vercel

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Click "Deploy"

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Configure Environment Variables in Vercel

Go to: **Settings → Environment Variables**

Add:
- **Variable**: `VITE_API_BASE_URL`
- **Value**: `http://dravya.hrntechsolutions.com/api`
- **Environments**: Production, Preview, Development

### 4. Redeploy After Setting Variables

After adding environment variables, redeploy from the Deployments tab.

### 5. Verify Deployment

1. ✅ Visit your Vercel URL
2. ✅ Open browser DevTools → Network tab
3. ✅ Verify API calls go to `http://dravya.hrntechsolutions.com/api`
4. ✅ Test login and transactions

## 🔧 Backend Configuration Required

### CORS Configuration

Your backend at `http://dravya.hrntechsolutions.com/api` needs to allow CORS requests from your Vercel domain.

Add to your PHP backend:
```php
// Allow requests from Vercel domain
header("Access-Control-Allow-Origin: https://your-project.vercel.app");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

Or allow all origins (for development):
```php
header("Access-Control-Allow-Origin: *");
```

## 📝 Notes

- The app automatically uses live API in production builds
- Environment variable `VITE_API_BASE_URL` can override the default
- Local development still uses `http://localhost/backend/api`
- All API endpoints are relative to the base URL:
  - `/api/payout/*`
  - `/api/admin/*`
  - `/api/vendor/*`
  - `/api/auth/*`

## 🐛 Troubleshooting

**Issue**: API calls failing with CORS error
- **Solution**: Configure CORS on backend (see above)

**Issue**: Wrong API URL being used
- **Solution**: Check `VITE_API_BASE_URL` environment variable in Vercel

**Issue**: Build fails
- **Solution**: Check Vercel build logs, ensure all dependencies are in `package.json`

## 🚀 After Deployment

Your live site will automatically:
- Use `http://dravya.hrntechsolutions.com/api` for all API calls
- Deploy automatically on every push to main branch
- Create preview deployments for PRs
