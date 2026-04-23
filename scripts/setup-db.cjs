const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'db.qjohjswvallpqkhlfkrl.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Money100$(0)00',
  ssl: { rejectUnauthorized: false }
});

const SQL = `
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  experience_years int2,
  account_size numeric(12,2),
  trading_style text,
  primary_instruments text[],
  goals text,
  timezone text DEFAULT 'Asia/Jerusalem',
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  subscription_status text DEFAULT 'free',
  is_pro boolean DEFAULT false,
  polar_customer_id text,
  account_type text,
  trading_methods text[] DEFAULT '{}',
  trading_sessions text[] DEFAULT '{}',
  min_confirmations integer,
  weaknesses text[] DEFAULT '{}',
  risk_per_trade text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  asset_class text,
  direction text CHECK (direction IN ('long','short')),
  entry_price numeric(18,8) NOT NULL,
  exit_price numeric(18,8),
  stop_loss numeric(18,8),
  take_profit numeric(18,8),
  lot_size numeric(10,4) NOT NULL DEFAULT 1,
  pnl numeric(12,2),
  pnl_pct numeric(8,4),
  status text DEFAULT 'open',
  entry_time timestamptz NOT NULL DEFAULT now(),
  exit_time timestamptz,
  timeframe text,
  setup_type text,
  notes text,
  screenshots text[],
  tags text[],
  rating int2,
  confirmations text[] DEFAULT '{}',
  followed_rules boolean,
  psychology_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can delete own trades" ON public.trades;
CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON public.trades FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON public.trades FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_entry ON public.trades(user_id, entry_time DESC);

CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Service role full access to chat_history" ON public.chat_history;
CREATE POLICY "Users can read own chat history" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat history" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access to chat_history" ON public.chat_history FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_created ON public.chat_history(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.economic_events_cache (
  id text PRIMARY KEY,
  title text NOT NULL,
  title_he text,
  country text,
  flag text,
  region text,
  event_date timestamptz NOT NULL,
  impact text,
  forecast text,
  previous text,
  actual text,
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE public.economic_events_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_economic_events" ON public.economic_events_cache;
DROP POLICY IF EXISTS "service_write_economic_events" ON public.economic_events_cache;
CREATE POLICY "public_read_economic_events" ON public.economic_events_cache FOR SELECT USING (true);
CREATE POLICY "service_write_economic_events" ON public.economic_events_cache FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_eec_event_date ON public.economic_events_cache(event_date);

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-screenshots', 'trade-screenshots', false) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.broker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metaapi_account_id text,
  account_name text,
  login text NOT NULL,
  server_name text NOT NULL,
  platform text NOT NULL DEFAULT 'mt5',
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, login, server_name)
);
ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own broker accounts" ON public.broker_accounts;
DROP POLICY IF EXISTS "Users can insert own broker accounts" ON public.broker_accounts;
DROP POLICY IF EXISTS "Users can update own broker accounts" ON public.broker_accounts;
DROP POLICY IF EXISTS "Users can delete own broker accounts" ON public.broker_accounts;
CREATE POLICY "Users can view own broker accounts" ON public.broker_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own broker accounts" ON public.broker_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own broker accounts" ON public.broker_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own broker accounts" ON public.broker_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);
`;

async function run() {
  await client.connect();
  console.log('Connected to database...');
  await client.query(SQL);
  console.log('✓ profiles table + RLS');
  console.log('✓ trades table + RLS');
  console.log('✓ chat_history table + RLS');
  console.log('✓ economic_events_cache table + RLS');
  console.log('✓ storage buckets (avatars, trade-screenshots)');
  console.log('✓ trigger: auto-create profile on signup');
  console.log('✓ broker_accounts table + RLS');
  console.log('\n✅ ALL DONE — database is ready!');
  await client.end();
}

run().catch(e => {
  console.error('❌ ERROR:', e.message);
  client.end();
});
