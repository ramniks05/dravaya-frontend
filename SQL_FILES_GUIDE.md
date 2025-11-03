# SQL Files Setup Guide

## Problem Solved! ✅

The markdown documentation had SQL code mixed with instructions, causing syntax errors when copying.

## Solution: Separate SQL Files

All SQL code is now in clean, ready-to-run files in the `supabase/` folder:

- ✅ `01_tables.sql` - All tables
- ✅ `02_admin_user.sql` - Admin user setup  
- ✅ `03_rls_policies.sql` - Security policies
- ✅ `04_functions_triggers.sql` - Automation
- ✅ `README.md` - Instructions

## How to Use

### Method 1: Copy-Paste (Fastest)

1. Open `supabase/01_tables.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Repeat for other files in order

### Method 2: Upload File (If Supported)

Some databases allow file upload:
1. Find the file upload option
2. Select the `.sql` file
3. Execute

## File Execution Order

**CRITICAL**: Run in this exact order!

```
1. 01_tables.sql           → Creates all 5 tables
2. [Manual Step]           → Create user in Dashboard
3. 02_admin_user.sql       → Creates admin profile
4. 03_rls_policies.sql     → Enables security
5. 04_functions_triggers.sql → Adds automation
```

## Quick Copy Commands

**Windows (PowerShell):**
```powershell
Get-Content supabase/01_tables.sql
```

**Mac/Linux:**
```bash
cat supabase/01_tables.sql
```

Then copy the output!

## Troubleshooting

**Error: "syntax error at or near"**
- ✅ Fixed! Use the separate SQL files instead of markdown
- Don't copy the "---" comment lines from markdown

**Error: "already exists"**
- Means it's already created, that's fine!
- Skip that file or drop and recreate

**Error: "permission denied"**
- You didn't create admin BEFORE enabling RLS
- Fix: Temporarily disable RLS, create admin, re-enable RLS

## Verification

After running all files, check with:

```sql
-- Should show 5 tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'wallets', 'beneficiaries', 'transactions', 'top_up_requests');
```

## What's Different?

**Before:**
```
❌ Mixed SQL + markdown in SUPABASE_SETUP.md
❌ Had to manually copy pieces
❌ Syntax errors from markdown
```

**Now:**
```
✅ Clean SQL files, ready to run
✅ Copy entire file at once
✅ No syntax errors
✅ Clear instructions in README
```

## Need Help?

Each file has clear comments explaining what it does.
See `supabase/README.md` for detailed instructions.


