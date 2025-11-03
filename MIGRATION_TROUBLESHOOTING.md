# Migration Troubleshooting Guide

If you encounter errors when running the payment migration, follow these steps:

## Error: Check constraint violated

**Error Message:**
```
ERROR: 23514: check constraint "beneficiaries_payment_mode_check" of relation "beneficiaries" is violated by some row
```

### Solution 1: Clean Migration (Recommended)

Run these commands in Supabase SQL Editor to clean up and re-run the migration:

```sql
-- Step 1: Drop existing constraints if they exist
ALTER TABLE public.beneficiaries 
DROP CONSTRAINT IF EXISTS beneficiaries_payment_mode_check;
ALTER TABLE public.beneficiaries 
DROP CONSTRAINT IF EXISTS beneficiaries_payment_mode_check_values;

-- Step 2: Drop columns if they were added incorrectly
ALTER TABLE public.beneficiaries 
DROP COLUMN IF EXISTS payment_mode;
ALTER TABLE public.beneficiaries 
DROP COLUMN IF EXISTS vpa_address;
ALTER TABLE public.beneficiaries 
DROP COLUMN IF EXISTS phone_number;

-- Step 3: Check if you have existing beneficiaries data
SELECT * FROM public.beneficiaries;

-- Step 4: Now run the entire migration script again
-- (Copy and run supabase/05_payment_migration.sql)
```

### Solution 2: Manual Fix for Existing Data

If you have existing beneficiaries that need special handling:

```sql
-- First, drop any existing constraints
ALTER TABLE public.beneficiaries 
DROP CONSTRAINT IF EXISTS beneficiaries_payment_mode_check;
ALTER TABLE public.beneficiaries 
DROP CONSTRAINT IF EXISTS beneficiaries_payment_mode_check_values;

-- Add columns without constraints
ALTER TABLE public.beneficiaries 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS vpa_address TEXT,
ADD COLUMN IF NOT EXISTS payment_mode TEXT;

-- Set default phone number
UPDATE public.beneficiaries 
SET phone_number = '0000000000' 
WHERE phone_number IS NULL;

-- Make phone_number required
ALTER TABLE public.beneficiaries 
ALTER COLUMN phone_number SET NOT NULL;

-- Handle each existing record individually based on its data
-- For records with both account_number and ifsc_code (IMPS/NEFT ready)
UPDATE public.beneficiaries 
SET payment_mode = 'IMPS'
WHERE account_number IS NOT NULL 
  AND account_number != '' 
  AND ifsc_code IS NOT NULL 
  AND ifsc_code != ''
  AND payment_mode IS NULL;

-- For all other records (UPI mode with placeholder VPA)
UPDATE public.beneficiaries 
SET payment_mode = 'UPI',
    vpa_address = COALESCE(vpa_address, 'placeholder' || id::text || '@upi')
WHERE payment_mode IS NULL;

-- Now add the constraints
ALTER TABLE public.beneficiaries
ADD CONSTRAINT beneficiaries_payment_mode_check_values 
CHECK (payment_mode IS NULL OR payment_mode IN ('UPI', 'IMPS', 'NEFT'));

ALTER TABLE public.beneficiaries
ADD CONSTRAINT beneficiaries_payment_mode_check CHECK (
  (payment_mode = 'UPI' AND vpa_address IS NOT NULL) OR
  (payment_mode IN ('IMPS', 'NEFT') AND account_number IS NOT NULL AND ifsc_code IS NOT NULL) OR
  (payment_mode IS NULL)
);
```

### Solution 3: Nuclear Option (Deletes Existing Beneficiaries)

**⚠️ WARNING: This will DELETE all existing beneficiary records!**

Only use if you don't have important data:

```sql
-- Delete all existing beneficiaries
DELETE FROM public.beneficiaries;

-- Now run the migration script
-- (Copy and run supabase/05_payment_migration.sql)
```

## Verify Migration Success

After running the migration, verify it worked:

```sql
-- Check that all beneficiaries have valid data
SELECT 
  id,
  name,
  payment_mode,
  CASE 
    WHEN payment_mode = 'UPI' AND vpa_address IS NULL THEN 'MISSING VPA'
    WHEN payment_mode IN ('IMPS', 'NEFT') AND (account_number IS NULL OR ifsc_code IS NULL) THEN 'MISSING BANK DETAILS'
    ELSE 'OK'
  END as status
FROM public.beneficiaries;

-- Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'beneficiaries' 
  AND constraint_name LIKE '%payment_mode%';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'beneficiaries'
  AND column_name IN ('phone_number', 'vpa_address', 'payment_mode');
```

All rows should show status = 'OK'.

## Common Issues

### Issue: Empty string vs NULL

PostgreSQL treats empty strings differently than NULL. If your existing data has empty strings:

```sql
-- Convert empty strings to NULL
UPDATE public.beneficiaries 
SET account_number = NULL 
WHERE account_number = '';

UPDATE public.beneficiaries 
SET ifsc_code = NULL 
WHERE ifsc_code = '';
```

### Issue: Transaction table constraints

If you also get errors on the transactions table:

```sql
-- Drop and recreate transaction status constraint
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'success', 'failed', 'reversed'));
```

## Need More Help?

If you're still having issues, check:

1. **Database Logs**: Supabase dashboard → Logs → Postgres Logs
2. **Current State**: Run `SELECT * FROM information_schema.table_constraints WHERE table_name = 'beneficiaries';`
3. **Data Inspection**: Run `SELECT * FROM public.beneficiaries;`

Share the error message and results of these queries for troubleshooting assistance.

