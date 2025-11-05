# Vercel Deployment Guide

This guide will help you deploy the Vendor Payout System to Vercel with the live backend API.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. The live backend API running at `http://dravya.hrntechsolutions.com/api`

## Step 1: Push Code to Git Repository

```bash
git add .
git commit -m "Prepare for Vercel deployment with live backend API"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect it's a Vite project
5. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

After deployment, configure environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

### Required Environment Variables

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_API_BASE_URL` | `http://dravya.hrntechsolutions.com/api` | Production, Preview, Development |

### Optional Environment Variables (if using Supabase)

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |

## Step 4: Redeploy After Setting Environment Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Check browser console for any errors
3. Verify API calls are going to `http://dravya.hrntechsolutions.com/api`
4. Test the application functionality

## API Configuration

The application automatically uses:
- **Production**: `http://dravya.hrntechsolutions.com/api` (live backend)
- **Development**: `http://localhost/backend/api` (local backend)

You can override this by setting `VITE_API_BASE_URL` environment variable.

## Troubleshooting

### API Calls Failing

1. **Check CORS**: Ensure your backend API allows requests from your Vercel domain
2. **Check Environment Variables**: Verify `VITE_API_BASE_URL` is set correctly
3. **Check Network Tab**: Open browser DevTools → Network tab to see API requests
4. **Check Backend Logs**: Verify backend is receiving requests

### Environment Variables Not Working

1. Make sure variable names start with `VITE_` (required for Vite)
2. Redeploy after adding/changing environment variables
3. Check Vercel build logs for environment variable warnings

### Build Errors

1. Check Vercel build logs in the dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version is compatible (check `package.json` engines)

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from other branches and PRs

## Support

For issues:
- Check Vercel documentation: https://vercel.com/docs
- Check Vite documentation: https://vitejs.dev
- Review build logs in Vercel dashboard

