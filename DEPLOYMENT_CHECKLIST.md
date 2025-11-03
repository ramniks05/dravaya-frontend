# Deployment Checklist

## Pre-Deployment Checklist

### Development Environment
- [x] Project initialized with Vite + React
- [x] All dependencies installed
- [x] No linter errors
- [x] Application runs locally without errors

### Supabase Setup
- [ ] Supabase project created
- [ ] All database tables created (profiles, wallets, beneficiaries, transactions, top_up_requests)
- [ ] RLS policies configured for all tables
- [ ] Helper functions and triggers created
- [ ] Initial admin user created BEFORE enabling RLS
- [ ] Admin profile inserted in profiles table
- [ ] Test login with admin credentials

### Configuration
- [ ] `.env` file created with correct Supabase credentials
- [ ] Environment variables tested in development
- [ ] No hardcoded credentials in code
- [ ] `.gitignore` configured correctly

### Code Review
- [x] All components implemented
- [x] Error handling in place
- [x] Loading states implemented
- [x] Responsive design verified
- [x] Navigation working correctly
- [x] Protected routes working
- [x] Role-based access control verified

## Vercel Deployment Steps

### 1. Git Repository Setup
- [ ] Initialize git repository
- [ ] Create `.gitignore` file
- [ ] Commit all code
- [ ] Push to GitHub

### 2. Vercel Setup
- [ ] Create Vercel account
- [ ] Import repository from GitHub
- [ ] Configure build settings:
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### 3. Environment Variables
Add these in Vercel project settings:
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

### 4. Deployment
- [ ] Deploy application
- [ ] Wait for build to complete
- [ ] Check for build errors
- [ ] Get deployment URL

### 5. Post-Deployment Testing
- [ ] Login with admin credentials
- [ ] Verify admin dashboard loads
- [ ] Create a test vendor
- [ ] Login as vendor
- [ ] Test vendor dashboard
- [ ] Add a beneficiary
- [ ] Request top-up as vendor
- [ ] Approve top-up as admin
- [ ] Send payout as vendor
- [ ] Check transaction history
- [ ] Verify filters work
- [ ] Test on mobile device

### 6. Final Checks
- [ ] All features working as expected
- [ ] No console errors in browser
- [ ] No network errors in console
- [ ] Performance is acceptable
- [ ] Responsive design works on all devices
- [ ] Links and navigation work correctly

## Production Configuration

### Supabase Production
- [ ] Create separate Supabase project for production (recommended)
- [ ] OR use production database in existing project
- [ ] Run all SQL setup scripts on production database
- [ ] Create production admin user
- [ ] Test production database connection

### Security
- [ ] RLS policies verified in production
- [ ] Admin-only operations protected
- [ ] Vendor data isolation working
- [ ] No sensitive data exposed
- [ ] HTTPS enabled (automatic with Vercel)

### Monitoring
- [ ] Set up error tracking (optional)
- [ ] Set up analytics (optional)
- [ ] Monitor Supabase usage
- [ ] Set up alerts for errors

## Rollback Plan

If deployment fails:
1. [ ] Keep previous working deployment
2. [ ] Check Vercel build logs
3. [ ] Check browser console for errors
4. [ ] Verify environment variables
5. [ ] Test Supabase connection
6. [ ] Review code changes
7. [ ] Fix issues and redeploy

## Go-Live Checklist

- [ ] Final testing completed
- [ ] All stakeholders notified
- [ ] User documentation ready
- [ ] Support plan in place
- [ ] Backup plan ready
- [ ] Monitoring active
- [ ] Deployment successful
- [ ] Application live and accessible

## Post-Launch

### Week 1
- [ ] Monitor for errors
- [ ] Check user feedback
- [ ] Monitor performance
- [ ] Review Supabase usage
- [ ] Check wallet balances accuracy
- [ ] Verify all transactions

### Ongoing
- [ ] Regular backups
- [ ] Security updates
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] User support

---

**Notes:**
- Keep this checklist updated as you deploy
- Document any issues and resolutions
- Maintain staging environment for testing

