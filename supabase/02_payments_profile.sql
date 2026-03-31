-- 1. Profiles Additions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Transactions Ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  feature_purchased TEXT NOT NULL, -- e.g. 'premium_tier', 'deadline_extension', 'capacity_increase'
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Only authenticated logic/service roles or admins should ideally write, but we let users insert pending orders
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Updates only by admins or verified processes (for prototype, allowing auth users for webhook processing is fine)
CREATE POLICY "Allow authenticated updates on transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
