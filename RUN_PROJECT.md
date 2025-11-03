# How to Run the Project

## Prerequisites
- Node.js 18+ installed
- npm installed
- Supabase database configured

## Step-by-Step Instructions

### 1. Install Dependencies
Open terminal in the `vendor-payout` folder and run:

```bash
npm install
```

This will install:
- React and dependencies
- Vite build tool
- TailwindCSS
- Supabase client
- React Router

### 2. Configure Environment
Make sure you have a `.env` file with:
```
VITE_SUPABASE_URL=https://voamxsbsfxzbffevaxkc.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### 3. Setup Database (CRITICAL!)
Before running the app, you MUST setup the Supabase database:

1. Go to https://supabase.com/dashboard
2. Open SQL Editor
3. Run these files in order from `supabase/` folder:
   - `01_tables.sql`
   - `02_admin_user.sql` (update with your user ID)
   - `03_rls_policies.sql`
   - `04_functions_triggers.sql`

See `supabase/README.md` for details.

### 4. Run Development Server

```bash
npm run dev
```

### 5. Open in Browser
Visit: http://localhost:5173

You should see the login page.

### 6. Login
Use the admin credentials you created in Step 3.

## Common Issues

**"Missing Supabase environment variables"**
- Check `.env` file exists in project root
- Verify variable names start with `VITE_`
- Restart dev server after editing `.env`

**"Failed to fetch"**
- Database not set up yet (see Step 3)
- Check Supabase project URL is correct
- Verify RLS policies are configured

**Cannot login**
- Admin user not created in database
- Verify profile exists in `profiles` table
- Check email/password are correct

**Port already in use**
- Another app is using port 5173
- Kill the process or change port in `vite.config.js`

## Production Build

To build for production:

```bash
npm run build
```

Output will be in `dist/` folder.

## Need Help?

Check:
- `QUICK_START.md` for detailed setup
- `SQL_FILES_GUIDE.md` for database setup
- Browser console for errors
- Supabase dashboard for database issues

