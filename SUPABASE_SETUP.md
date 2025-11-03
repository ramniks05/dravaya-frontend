# Supabase Database Setup

## Quick Setup (Recommended)

**The easiest way**: Use the separate SQL files in the `supabase/` folder!

1. Go to your Supabase project SQL Editor
2. Run these files IN ORDER:
   - `supabase/01_tables.sql` - Create all tables
   - `supabase/02_admin_user.sql` - Create admin (manually create user first!)
   - `supabase/03_rls_policies.sql` - Enable security
   - `supabase/04_functions_triggers.sql` - Add automation

See `supabase/README.md` for detailed instructions.

---

## Manual Setup (Alternative)

If you prefer to copy-paste, follow the sections below:

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Note down your project URL and anon key

## 2. Database Tables

Run these SQL queries in the Supabase SQL Editor:

### Enable UUID Extension
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Create profiles table (extends auth.users)
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'vendor')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create wallets table
```sql
CREATE TABLE public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create beneficiaries table
```sql
CREATE TABLE public.beneficiaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  ifsc_code TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create transactions table
```sql
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('top_up', 'payout')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  beneficiary_id UUID REFERENCES public.beneficiaries(id),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  reference_number TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create top_up_requests table
```sql
CREATE TABLE public.top_up_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  notes TEXT,
  admin_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Create Initial Admin User (BEFORE enabling RLS)

**CRITICAL**: You must create your admin user NOW before enabling RLS, otherwise you'll be locked out!

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click **Add User**
3. Enter email and password (e.g., admin@dravyatech.com)
4. Uncheck "Auto Confirm User" if you want to verify email
5. Click **Create User**
6. Note the user ID from the users list
7. Run this SQL to create the admin profile (replace YOUR_USER_UUID and admin@example.com with your values):

```sql
INSERT INTO public.profiles (id, email, role, status)
VALUES ('YOUR_USER_UUID', 'admin@example.com', 'admin', 'active');
```

## 4. Row Level Security (RLS) Policies

Enable RLS on all tables:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_up_requests ENABLE ROW LEVEL SECURITY;
```

### Profiles Policies
```sql
-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can see their own profile
CREATE POLICY "Vendors can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Wallets Policies
```sql
-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can view their own wallet
CREATE POLICY "Vendors can view own wallet" ON public.wallets
  FOR SELECT USING (vendor_id = auth.uid());

-- Admins can insert wallets
CREATE POLICY "Admins can insert wallets" ON public.wallets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all wallets
CREATE POLICY "Admins can update all wallets" ON public.wallets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Beneficiaries Policies
```sql
-- Admins can view all beneficiaries
CREATE POLICY "Admins can view all beneficiaries" ON public.beneficiaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can manage their own beneficiaries
CREATE POLICY "Vendors can manage own beneficiaries" ON public.beneficiaries
  FOR ALL USING (vendor_id = auth.uid());
```

### Transactions Policies
```sql
-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can view their own transactions
CREATE POLICY "Vendors can view own transactions" ON public.transactions
  FOR SELECT USING (vendor_id = auth.uid());

-- Admins can insert transactions
CREATE POLICY "Admins can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can insert their own transactions
CREATE POLICY "Vendors can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (vendor_id = auth.uid());
```

### Top Up Requests Policies
```sql
-- Admins can view all top-up requests
CREATE POLICY "Admins can view all top-up requests" ON public.top_up_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can view their own top-up requests
CREATE POLICY "Vendors can view own top-up requests" ON public.top_up_requests
  FOR SELECT USING (vendor_id = auth.uid());

-- Admins can update all top-up requests
CREATE POLICY "Admins can update all top-up requests" ON public.top_up_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Vendors can insert their own top-up requests
CREATE POLICY "Vendors can insert own top-up requests" ON public.top_up_requests
  FOR INSERT WITH CHECK (vendor_id = auth.uid());
```

## 5. Helper Functions

### Generate unique reference number
```sql
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
  ref_num TEXT;
BEGIN
  ref_num := 'REF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 8);
  RETURN ref_num;
END;
$$ LANGUAGE plpgsql;
```

### Update wallet balance on transaction
```sql
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'top_up' THEN
    UPDATE public.wallets
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE vendor_id = NEW.vendor_id;
  ELSIF NEW.type = 'payout' THEN
    UPDATE public.wallets
    SET balance = balance - NEW.amount,
        updated_at = NOW()
    WHERE vendor_id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_completed
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_wallet_balance();
```

## 6. Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

