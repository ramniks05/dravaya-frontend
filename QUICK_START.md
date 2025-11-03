# Quick Start Guide

Get your vendor payout system up and running in 5 minutes.

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Step 1: Install Dependencies

```bash
cd vendor-payout
npm install
```

## Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize
3. Copy your project URL and anon key from Settings > API

## Step 3: Configure Database

**Easy Method - Use SQL Files:**

1. In Supabase, go to SQL Editor
2. Run these files from `supabase/` folder IN ORDER:
   - `01_tables.sql` → Copy entire file → Paste → Run
   - **Create admin user in Dashboard** (see below)
   - `02_admin_user.sql` → Replace YOUR_USER_UUID → Run
   - `03_rls_policies.sql` → Copy entire file → Paste → Run
   - `04_functions_triggers.sql` → Copy entire file → Paste → Run
3. **IMPORTANT**: Create your admin user AFTER step 1, BEFORE step 3!

## Step 4: Configure Environment

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual values from Step 2.

## Step 5: Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Step 6: Login

Use the admin email and password you created in Supabase to login.

## Common Issues

### "Missing Supabase environment variables"
- Make sure your `.env` file is in the root directory
- Check that variable names start with `VITE_`
- Restart the dev server after creating/editing `.env`

### "Unable to login"
- Verify the admin user was created in Supabase Auth
- Check that the profile was inserted in the profiles table
- Ensure email is confirmed in Supabase

### "Failed to fetch"
- Check your Supabase URL and anon key
- Verify RLS policies are set up correctly
- Check browser console for specific error messages

### "Permission denied"
- Admin profile might not exist in the profiles table
- Check that you created the profile before enabling RLS

## Next Steps

1. Create your first vendor from the admin dashboard
2. Test the vendor login
3. Try adding beneficiaries
4. Test a top-up request flow
5. Send a sample payout

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel settings
5. Deploy!

Your application will be live at `yourproject.vercel.app`

