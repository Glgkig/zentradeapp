-- Extended onboarding profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type      text,
  ADD COLUMN IF NOT EXISTS trading_methods   text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trading_sessions  text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_confirmations integer,
  ADD COLUMN IF NOT EXISTS weaknesses        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS risk_per_trade    text;
